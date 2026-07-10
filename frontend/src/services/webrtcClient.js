// Simple mesh-free 1:1 WebRTC helper. Signaling (offer/answer/ICE) rides over the
// same STOMP socket used for chat, scoped to /topic/rooms/{roomId}/signal.
//
// Uses only Google's public STUN server. That's enough to connect on most open
// networks, but there's no TURN server configured, so calls across strict/symmetric
// NATs (common on some corporate or mobile networks) may fail to connect — a TURN
// server (e.g. via a provider like Twilio or coturn) would be needed to fix that.
const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }]

export function createPeerConnection({ onRemoteStream, onIceCandidate }) {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

  pc.ontrack = (event) => {
    onRemoteStream(event.streams[0])
  }

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate)
    }
  }

  return pc
}

export async function attachLocalStream(pc, stream) {
  stream.getTracks().forEach((track) => pc.addTrack(track, stream))
}

export async function createOffer(pc) {
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  return offer
}

export async function createAnswer(pc, remoteOffer) {
  await pc.setRemoteDescription(new RTCSessionDescription(remoteOffer))
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  return answer
}

export async function acceptAnswer(pc, remoteAnswer) {
  await pc.setRemoteDescription(new RTCSessionDescription(remoteAnswer))
}

export async function addIceCandidate(pc, candidate) {
  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate))
  } catch {
    // Candidates that arrive before the remote description is set are safe to drop;
    // the ICE agent will pick up enough others to connect.
  }
}
