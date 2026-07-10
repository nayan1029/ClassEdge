import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { sessionService } from '../services/session'
import Loader from '../components/common/Loader'

// Landed on after Google OAuth succeeds — see backend OAuth2LoginSuccessHandler,
// which redirects here with ?token=<jwt>.
export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('Google sign-in did not return a token. Please try again.')
      return
    }

    localStorage.setItem('studybuddy_token', token)

    authApi.me()
      .then((user) => {
        sessionService.saveSession(user, token)
        const redirectTo = sessionStorage.getItem('studybuddy_oauth_redirect') || '/dashboard'
        sessionStorage.removeItem('studybuddy_oauth_redirect')
        navigate(redirectTo, { replace: true })
      })
      .catch(() => {
        setError('Could not complete Google sign-in. Please try again.')
      })
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="text-center space-y-3">
        {!error ? (
          <Loader text="Finishing sign-in..." />
        ) : (
          <>
            <p className="text-sm text-red-600">{error}</p>
            <a href="/login" className="text-indigo-600 hover:underline text-sm">Back to login</a>
          </>
        )}
      </div>
    </div>
  )
}

