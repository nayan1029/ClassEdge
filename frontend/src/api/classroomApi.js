import api from '../services/http'

export const classroomApi = {
  list: async () => {
    const { data } = await api.get('/classrooms')
    return data
  },
  create: async (payload) => {
    const { data } = await api.post('/classrooms', payload)
    return data
  },
  join: async (classCode) => {
    const { data } = await api.post('/classrooms/join', { classCode })
    return data
  },
  get: async (classroomId) => {
    const { data } = await api.get(`/classrooms/${classroomId}`)
    return data
  },
  roster: async (classroomId) => {
    const { data } = await api.get(`/classrooms/${classroomId}/roster`)
    return data
  },
  listAnnouncements: async (classroomId) => {
    const { data } = await api.get(`/classrooms/${classroomId}/announcements`)
    return data
  },
  postAnnouncement: async (classroomId, content) => {
    const { data } = await api.post(`/classrooms/${classroomId}/announcements`, { content })
    return data
  },
  listAssignments: async (classroomId) => {
    const { data } = await api.get(`/classrooms/${classroomId}/assignments`)
    return data
  },
  createAssignment: async (classroomId, payload) => {
    const { data } = await api.post(`/classrooms/${classroomId}/assignments`, payload)
    return data
  },
  submitAssignment: async (assignmentId, content) => {
    const { data } = await api.post(`/assignments/${assignmentId}/submit`, { content })
    return data
  },
  listSubmissions: async (assignmentId) => {
    const { data } = await api.get(`/assignments/${assignmentId}/submissions`)
    return data
  },
  gradeSubmission: async (submissionId, payload) => {
    const { data } = await api.post(`/submissions/${submissionId}/grade`, payload)
    return data
  },
}
