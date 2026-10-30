import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { MessageCircle, Send } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { classroomApi } from '../api/classroomApi'
import api from '../services/http'
import { sessionService } from '../services/session'
import Card from '../components/common/Card'
import Loader from '../components/common/Loader'

export default function CommunicationPage() {
  const queryClient = useQueryClient()
  const [classroomId, setClassroomId] = useState('')
  const [draft, setDraft] = useState('')
  const [connection, setConnection] = useState('connecting')
  const clientRef = useRef(null)
  const bottomRef = useRef(null)
  const classes = useQuery({ queryKey: ['classrooms'], queryFn: classroomApi.list })
  const chosenClass = useMemo(() => (classes.data || []).find((room) => String(room.id) === String(classroomId)), [classes.data, classroomId])
  const messagesKey = ['classroom-chat', classroomId]
  const messages = useQuery({ queryKey: messagesKey, queryFn: async () => (await api.get(`/classrooms/${classroomId}/messages`)).data, enabled: Boolean(classroomId) })

  useEffect(() => {
    if (!classroomId) return undefined
    const { token } = sessionService.getSession()
    const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '')
    const client = new Client({
      webSocketFactory: () => new SockJS(`${base}/ws/chat`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        setConnection('connected')
        client.subscribe(`/topic/classes/${classroomId}/chat`, (frame) => {
          const incoming = JSON.parse(frame.body)
          queryClient.setQueryData(messagesKey, (current = []) => current.some((message) => message.id === incoming.id) ? current : [...current, incoming])
        })
      },
      onWebSocketClose: () => setConnection('reconnecting'),
      onStompError: () => setConnection('error'),
      onWebSocketError: () => setConnection('error'),
    })
    clientRef.current = client
    client.activate()
    return () => { clientRef.current = null; client.deactivate() }
  }, [classroomId, queryClient])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.data])

  if (classes.isLoading) return <Loader text="Loading classrooms" />
  const send = (event) => {
    event.preventDefault()
    if (!draft.trim() || clientRef.current?.connected !== true) return
    clientRef.current.publish({ destination: `/app/classes/${classroomId}/chat`, body: JSON.stringify({ content: draft.trim() }) })
    setDraft('')
  }

  return <div className="space-y-5 text-slate-900 dark:text-slate-100"><header><h1 className="text-2xl font-bold">Class Communication</h1><p className="mt-1 text-sm text-slate-500">Realtime chat with the students and teacher in your class.</p></header><Card><div className="flex flex-wrap items-center justify-between gap-3"><label className="text-sm font-medium">Class<select value={classroomId} onChange={(e) => setClassroomId(e.target.value)} className="ml-3 min-w-56 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"><option value="">Choose a class</option>{(classes.data || []).map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>{classroomId && <span className={`text-xs ${connection === 'connected' ? 'text-emerald-600' : connection === 'error' ? 'text-red-600' : 'text-amber-600'}`}><span className="mr-1 inline-block h-2 w-2 rounded-full bg-current"/>{connection}</span>}</div></Card>{!classroomId ? <Card><div className="py-14 text-center"><MessageCircle size={30} className="mx-auto text-slate-400"/><p className="mt-3 font-medium">Choose one of your classes</p><p className="mt-1 text-sm text-slate-500">Only classroom members can read or send messages.</p></div></Card> : <Card className="flex h-[min(65vh,680px)] flex-col"><div className="border-b border-slate-100 pb-3 dark:border-slate-800"><h2 className="font-semibold">{chosenClass?.name || 'Class chat'}</h2><p className="text-xs text-slate-500">Messages are shared with this class</p></div><div className="flex-1 space-y-3 overflow-y-auto py-4">{messages.isLoading ? <Loader text="Loading messages"/> : messages.data?.length ? messages.data.map((message) => <div key={message.id} className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${message.senderName === sessionService.getUser()?.name ? 'ml-auto bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}><div className="mb-1 flex items-center justify-between gap-4 text-[10px] opacity-70"><span>{message.senderName}</span><time>{new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div><p className="whitespace-pre-wrap break-words text-sm">{message.content}</p></div>) : <p className="py-10 text-center text-sm text-slate-500">No messages yet. Start the conversation.</p>}<div ref={bottomRef}/></div><form onSubmit={send} className="flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800"><input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={4000} placeholder={connection === 'connected' ? 'Write a message…' : 'Connecting to class chat…'} disabled={connection !== 'connected'} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"/><button type="submit" aria-label="Send message" disabled={!draft.trim() || connection !== 'connected'} className="rounded-xl bg-blue-600 px-4 text-white disabled:opacity-50"><Send size={17}/></button></form></Card>}</div>
}
