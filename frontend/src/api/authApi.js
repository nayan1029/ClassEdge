import api from '../services/http'

export const authApi = {
	login: async (payload) => {
		const { data } = await api.post('/auth/login', payload)
		return data
	},
	register: async (payload) => {
		const { data } = await api.post('/auth/register', payload)
		return data
	},
	me: async () => {
		const { data } = await api.get('/auth/me')
		return data
	},
	verifyEmail: async (token) => {
		const { data } = await api.post('/auth/verify-email', null, { params: { token } })
		return data
	},
	resendVerification: async () => {
		const { data } = await api.post('/auth/resend-verification')
		return data
	},
	forgotPassword: async (email) => {
		const { data } = await api.post('/auth/forgot-password', { email })
		return data
	},
	resetPassword: async (token, newPassword) => {
		const { data } = await api.post('/auth/reset-password', { token, newPassword })
		return data
	},
	// Root of the API server without the trailing /api segment, used for the
	// non-REST OAuth2 redirect endpoint that Spring Security serves at /oauth2/**.
	googleLoginUrl: (redirectTo = '/dashboard') => {
		const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '')
		const target = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard'
		sessionStorage.setItem('studybuddy_oauth_redirect', target)
		return `${base}/oauth2/authorization/google`
	},
}

