import api from '../services/http'

export const dashboardApi = {
	fetchDashboard: async () => {
		const { data } = await api.get('/analytics/dashboard')
		return data
	},
}
