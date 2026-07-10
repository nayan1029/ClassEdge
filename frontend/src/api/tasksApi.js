import api from '../services/http'

export const tasksApi = {
  getAll: async () => {
    const { data } = await api.get('/tasks')
    return data
  },
  create: async (payload) => {
    const { data } = await api.post('/tasks', payload)
    return data
  },
}
