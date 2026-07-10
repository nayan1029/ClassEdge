const USER_STORAGE_KEY = 'studybuddy_user'
const TOKEN_STORAGE_KEY = 'studybuddy_token'

function readStoredJson(key) {
  try {
    const rawValue = localStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) : null
  } catch {
    return null
  }
}

export const sessionService = {
  getSession: () => ({
    user: readStoredJson(USER_STORAGE_KEY),
    token: localStorage.getItem(TOKEN_STORAGE_KEY),
  }),
  getUser: () => readStoredJson(USER_STORAGE_KEY),
  isAuthenticated: () => Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)),
  saveSession: (user, token) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  },
  clearSession: () => {
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  },
}
