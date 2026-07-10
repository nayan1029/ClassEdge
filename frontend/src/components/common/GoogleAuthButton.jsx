import React from 'react'
import { authApi } from '../../api/authApi'

// Only meaningfully clickable once the backend has GOOGLE_CLIENT_ID configured —
// otherwise Spring Security has no /oauth2/authorization/google route registered
// and this will 404. See backend/src/main/java/com/studybuddy/config/OAuth2ClientConfig.java.
export default function GoogleAuthButton({ label = 'Continue with Google', redirectTo = '/dashboard' }) {
  return (
    <a
      href={authApi.googleLoginUrl(redirectTo)}
      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.88c2.27-2.09 3.54-5.17 3.54-8.82z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.75-2.1-6.69-4.93H1.3v3.09C3.26 21.3 7.31 24 12 24z" />
        <path fill="#FBBC05" d="M5.31 14.32c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.67H1.3A11.97 11.97 0 000 12.04c0 1.94.46 3.77 1.3 5.37l4.01-3.09z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.67l4.01 3.09c.94-2.83 3.58-4.93 6.69-4.93z" />
      </svg>
      {label}
    </a>
  )
}

