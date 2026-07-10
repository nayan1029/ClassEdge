import React, { useEffect, useRef, useState } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import ChatMarkdown from '../components/common/ChatMarkdown'
import { aiApi } from '../api/aiApi'

const QUICK_PROMPTS = [
  'Explain photosynthesis in simple terms',
  'Make a study plan for my Java exam',
  'Give me 5 quiz questions on React hooks',
  'How do I revise effectively in 2 days?',
]

function createMessage(role, content, extra = {}) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    ...extra,
  }
}

export default function AssistantPage() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([
    createMessage(
      'assistant',
      'Hi, I am your StudyBuddy assistant. Ask me to explain a topic, create a revision plan, or quiz you on a subject.'
    ),
  ])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamError, setStreamError] = useState('')
  const messagesEndRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cancel any in-flight stream if the page unmounts mid-response.
  useEffect(() => () => abortRef.current?.abort(), [])

  const sendQuestion = async (rawQuestion) => {
    const trimmedQuestion = rawQuestion.trim()
    if (!trimmedQuestion || isStreaming) return

    const conversation = [...messages, createMessage('user', trimmedQuestion)]
    const assistantMessageId = `${Date.now()}-${Math.random().toString(16).slice(2)}`

    setMessages([...conversation, { id: assistantMessageId, role: 'assistant', content: '' }])
    setQuestion('')
    setStreamError('')
    setIsStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      await aiApi.streamAssistant(
        {
          text: trimmedQuestion,
          history: conversation.slice(-8).map((message) => ({
            role: message.role,
            content: message.content,
          })),
        },
        {
          signal: controller.signal,
          onChunk: (chunk) => {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantMessageId
                  ? { ...message, content: message.content + chunk }
                  : message
              )
            )
          },
        }
      )
    } catch (err) {
      if (err.name !== 'AbortError') {
        setStreamError('I could not answer that right now. Try again in a moment or rephrase the topic.')
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId && !message.content
              ? { ...message, content: 'I could not answer that right now. Try again in a moment or rephrase the topic.' }
              : message
          )
        )
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendQuestion(question)
  }

  const handleQuickPrompt = (prompt) => {
    setQuestion(prompt)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendQuestion(question)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">AI Study Assistant</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Chat naturally, ask follow-up questions, and keep the conversation focused on your study goal.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card title="Quick prompts" className="h-fit">
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Start with one of these, or type your own question below.
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleQuickPrompt(prompt)}
                  className="rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 p-4 text-sm text-indigo-900 dark:text-indigo-100">
              <p className="font-semibold mb-1">How it works</p>
              <p>
                Replies stream in live, like a real chatbot. Connect a Gemini or OpenAI key on the backend
                for genuine AI answers — without one, you still get a live-typed reply from the built-in tutor logic.
              </p>
            </div>
          </div>
        </Card>

        <Card title="Chat with StudyBuddy" className="flex h-[70vh] flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 rounded-bl-md'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <>
                      <ChatMarkdown content={message.content} />
                      {isStreaming && message.id === messages[messages.length - 1]?.id && (
                        <span className="inline-block w-1.5 h-4 ml-0.5 -mb-0.5 bg-current opacity-60 animate-pulse" />
                      )}
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Ask your next study question
            </label>
            <textarea
              className="w-full min-h-28 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a topic, concept, or revision goal. Press Enter to send, Shift+Enter for a new line."
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {streamError || 'Keep the conversation going with follow-up questions for examples, summaries, or practice prompts.'}
              </p>
              <Button type="submit" disabled={isStreaming || !question.trim()}>
                {isStreaming ? 'Replying...' : 'Send message'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
