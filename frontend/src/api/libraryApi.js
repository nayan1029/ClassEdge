import api from '../services/http'

export const libraryApi = {
  list: async () => (await api.get('/library/modules')).data,
  upload: async (payload) => (await api.post('/library/modules', payload, { headers: { 'Content-Type': 'multipart/form-data' } })).data,
  remove: async (id) => api.delete(`/library/modules/${id}`),
  download: async (id) => (await api.get(`/library/modules/${id}/download`, { responseType: 'blob' })).data,
}
