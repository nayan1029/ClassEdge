import api from '../services/http'

export const timetableApi = {
  get: async () => {
    const { data } = await api.get('/timetable')
    return data
  },
  generate: async (payload) => {
    const { data } = await api.post('/timetable/generate', payload)
    return data
  },
}
