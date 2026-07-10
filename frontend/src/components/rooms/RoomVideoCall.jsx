import React, { useEffect, useRef, useState } from 'react'
import Button from '../common/Button'
import {
  createPeerConnection,
  attachLocalStream,
  createOffer,
  createAnswer,
  acceptAnswer,
  addIceCandidate,
} from '../../services/webrtcClient'

// 1:1 video calling scoped to a study room. See webrtcClient.js for the
// STUN-only connectivity caveat. More than two participants calling at once
// isn't supported yet — that needs a proper mesh/SFU implementation.
export default function RoomVideoCall({ room, chatClient, connected }) {
  const [active, setActive] = useState(false)
  const [status, setStatus] = useState('idle')
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const senderIdRef = useRef(Math.random().toString(36).slice(2))
  const hasOfferedRef = useRef(false)

  useEffect(() => {
    if (!active || !chatClient || !connected) return undefined

    let cancelled = false

    function publish(partial) {
      chatClient.publish({
        destination: '/app/signal/send',
        body: JSON.stringify({ roomId: room.id, senderId: senderIdRef.current, ...partial }),
      })
    }

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        localStreamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream

        const pc = createPeerConnection({
          onRemoteStream: (remoteStream) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream
            setStatus('connected')
          },
          onIceCandidate: (candidate) => publish({ type: 'candidate', data: candidate }),
        })
        pcRef.current = pc
        await attachLocalStream(pc, stream)

        setStatus('waiting-for-peer')
        publish({ type: 'join' })
      } catch {
        setStatus('camera-error')
      }
    }

    const subscription = chatClient.subscribe(`/topic/rooms/${room.id}/signal`, async (frame) => {
      let payload
      try {
        payload = JSON.parse(frame.body)
      } catch {
        return
      }
      if (payload.senderId === senderIdRef.current || !pcRef.current) return
      const pc = pcRef.current

      if (payload.type === 'join' && !hasOfferedRef.current) {
        // Someone else just joined while we were already here — we initiate.
        hasOfferedRef.current = true
        const offer = await createOffer(pc)
        publish({ type: 'offer', data: offer })
      } else if (payload.type === 'offer') {
        const answer = await createAnswer(pc, payload.data)
        publish({ type: 'answer', data: answer })
      } else if (payload.type === 'answer') {
        await acceptAnswer(pc, payload.data)
      } else if (payload.type === 'candidate') {
        await addIceCandidate(pc, payload.data)
      }
    })

    start()

    return () => {
      cancelled = true
      subscription?.unsubscribe()
      pcRef.current?.close()
      pcRef.current = null
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
      hasOfferedRef.current = false
      setStatus('idle')
    }
  }, [active, chatClient, connected, room.id])

  return (
    <div className="space-y-3">
      {!active ? (
        <Button onClick={() => setActive(true)} disabled={!connected}>
          {connected ? 'Start Video Call' : 'Connecting...'}
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">You</p>
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full rounded-lg bg-black aspect-video" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Peer</p>
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-lg bg-black aspect-video" />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {status === 'waiting-for-peer' && 'Waiting for someone else to join this call...'}
            {status === 'connected' && 'Connected.'}
            {status === 'camera-error' && 'Could not access your camera/microphone — check browser permissions.'}
          </p>
          <Button variant="secondary" onClick={() => setActive(false)}>End Call</Button>
        </div>
      )}
    </div>
  )
}
