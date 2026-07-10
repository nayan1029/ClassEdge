import api from '../services/http'

export const roomsApi = {
  getAll: async () => {
    const { data } = await api.get('/rooms')
    return data
  },
  create: async (payload) => {
    const { data } = await api.post('/rooms', payload)
    return data
  },
  join: async (roomId) => {
    const { data } = await api.post(`/rooms/${roomId}/join`)
    return data
  },
  getMessages: async (roomId) => {
    const { data } = await api.get(`/rooms/${roomId}/messages`)
    return data
  },
}
