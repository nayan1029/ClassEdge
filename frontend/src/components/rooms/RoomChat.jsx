import React, { useEffect, useRef, useState } from 'react'
import Button from '../common/Button'
import { roomsApi } from '../../api/roomsApi'
import { subscribeToRoom, sendChatMessage } from '../../services/chatClient'
import { sessionService } from '../../services/session'

export default function RoomChat({ room, chatClient, connected }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(true)
  const bottomRef = useRef(null)
  const user = sessionService.getUser()

  useEffect(() => {
    let active = true
    setLoadingHistory(true)
    roomsApi.getMessages(room.id)
      .then((history) => {
        if (active) setMessages(history)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingHistory(false)
      })
    return () => {
      active = false
    }
  }, [room.id])

  useEffect(() => {
    if (!chatClient || !connected) return undefined
    const subscription = subscribeToRoom(chatClient, room.id, (message) => {
      setMessages((prev) => [...prev, message])
    })
    return () => subscription?.unsubscribe()
  }, [chatClient, connected, room.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onSend = (event) => {
    event.preventDefault()
    if (!draft.trim() || !connected) return
    sendChatMessage(chatClient, { roomId: room.id, senderEmail: user?.email, content: draft.trim() })
    setDraft('')
  }

  return (
    <div className="flex flex-col h-80">
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loadingHistory && <p className="text-sm text-gray-500">Loading messages...</p>}
        {!loadingHistory && messages.length === 0 && (
          <p className="text-sm text-gray-500">No messages yet — say hello!</p>
        )}
        {messages.map((message) => (
          <div key={message.id ?? `${message.sender}-${message.sentAt}-${Math.random()}`} className="text-sm">
            <span className="font-medium text-gray-900 dark:text-gray-100">{message.sender}: </span>
            <span className="text-gray-700 dark:text-gray-300">{message.content}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={onSend} className="mt-3 flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700 text-sm"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={connected ? 'Type a message...' : 'Connecting to chat...'}
          disabled={!connected}
        />
        <Button type="submit" disabled={!connected || !draft.trim()}>Send</Button>
      </form>
    </div>
  )
}
