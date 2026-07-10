import axios from 'axios'
import { sessionService } from './session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const session = sessionService.getSession()
  if (session.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionService.clearSession()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
