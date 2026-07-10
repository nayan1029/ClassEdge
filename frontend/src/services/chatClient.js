import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

// Root of the API server without the trailing /api segment — the STOMP endpoint
// is served at /ws/chat, not under /api.
function wsBaseUrl() {
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '')
  return `${base}/ws/chat`
}

/**
 * Thin wrapper around @stomp/stompjs + sockjs-client for the study-room chat.
 * Connects once, lets callers subscribe to a room's topic, and cleans up on leave.
 */
export function createChatClient({ onConnect, onError }) {
  const client = new Client({
    webSocketFactory: () => new SockJS(wsBaseUrl()),
    reconnectDelay: 3000,
    onConnect,
    onStompError: onError,
    onWebSocketError: onError,
  })

  client.activate()
  return client
}

export function subscribeToRoom(client, roomId, onMessage) {
  return client.subscribe(`/topic/rooms/${roomId}`, (message) => {
    try {
      onMessage(JSON.parse(message.body))
    } catch {
      // Ignore malformed frames rather than crashing the chat UI.
    }
  })
}

export function sendChatMessage(client, { roomId, senderEmail, content }) {
  if (!client?.connected) {
    return
  }
  client.publish({
    destination: '/app/chat/send',
    body: JSON.stringify({ roomId, senderEmail, content }),
  })
}
