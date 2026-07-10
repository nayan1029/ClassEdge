import api from '../services/http'
import { sessionService } from '../services/session'

export const aiApi = {
  askAssistant: async (payload) => {
    const { data } = await api.post('/ai/assistant', payload)
    return data
  },
  summarize: async (payload) => {
    const { data } = await api.post('/ai/summarize', payload)
    return data
  },
  analyzeResume: async (payload) => {
    const { data } = await api.post('/ai/resume/analyze', payload)
    return data
  },
  // Streams the assistant's reply as it's generated. onChunk is called with each
  // new piece of text (already appended is the caller's job — this just delivers
  // deltas). Uses fetch + ReadableStream directly instead of axios, since axios
  // doesn't expose a streaming read API in the browser.
  streamAssistant: async (payload, { onChunk, signal }) => {
    const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api')
    const { token } = sessionService.getSession()

    const response = await fetch(`${base}/ai/assistant/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal,
    })

    if (!response.ok || !response.body) {
      throw new Error(`Assistant stream failed with status ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      const text = decoder.decode(value, { stream: true })
      if (text) onChunk(text)
    }
  },
}
