import api from '../services/http'

export const notesApi = {
	create: async (payload) => {
		const { data } = await api.post('/notes', payload)
		return data
	},
	getAll: async () => {
		const { data } = await api.get('/notes')
		return data
	},
	summarize: async (payload) => {
		const { data } = await api.post('/ai/summarize', payload)
		return data
	},
}
