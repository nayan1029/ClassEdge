import api from '../services/http'

export const quizApi = {
	generate: async (payload) => {
		const { data } = await api.post('/quiz/generate', payload)
		return data
	},
}
