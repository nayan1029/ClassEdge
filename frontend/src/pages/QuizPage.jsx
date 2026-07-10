import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { quizApi } from '../api/quizApi'

export default function QuizPage() {
  const [topic, setTopic] = useState('Data Structures')
  const [difficulty, setDifficulty] = useState('medium')

  const mutation = useMutation({ mutationFn: quizApi.generate })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">AI Quiz Generator</h1>
      <Card title="Generate Quiz">
        <div className="grid md:grid-cols-3 gap-3">
          <input className="px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700" value={topic} onChange={(e) => setTopic(e.target.value)} />
          <select className="px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <Button onClick={() => mutation.mutate({ topic, difficulty })} disabled={mutation.isPending}>{mutation.isPending ? 'Generating...' : 'Generate'}</Button>
        </div>
      </Card>
      {mutation.data?.questions && (
        <Card title="Generated Questions">
          <ol className="list-decimal pl-5 space-y-4">
            {mutation.data.questions.map((question, index) => (
              <li key={question.question || index}>
                <p className="font-medium">{question.question || question}</p>
                {question.options?.length > 0 && (
                  <ul className="mt-2 grid sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                    {question.options.map((option) => <li key={option} className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">{option}</li>)}
                  </ul>
                )}
                {question.answer && <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-300">Answer: {question.answer}</p>}
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  )
}
