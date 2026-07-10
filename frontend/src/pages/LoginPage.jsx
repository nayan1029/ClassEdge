import React, { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import GoogleAuthButton from '../components/common/GoogleAuthButton'
import { authApi } from '../api/authApi'
import { sessionService } from '../services/session'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const redirectTo = location.state?.from?.pathname || '/dashboard'
  const googleError = searchParams.get('error')

  const validateForm = () => {
    if (!form.email || !form.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    return true
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const data = await authApi.login(form)
      sessionService.saveSession(data.user, data.token)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const errorData = err.response?.data
      if (errorData?.errors) {
        const fieldErrors = Object.entries(errorData.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(' | ')
        setError(fieldErrors)
      } else {
        setError(errorData?.message || 'Login failed')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-800 space-y-4">
        <h1 className="text-xl font-semibold">Welcome Back</h1>
        <Input 
          label="Email" 
          type="email" 
          value={form.email} 
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
          required 
          placeholder="student@example.com"
        />
        <Input 
          label="Password" 
          type="password" 
          value={form.password} 
          onChange={(e) => setForm({ ...form, password: e.target.value })} 
          required 
          placeholder="••••••••"
        />
        <div className="text-right -mt-2">
          <Link className="text-xs text-indigo-600 hover:underline" to="/forgot-password">Forgot password?</Link>
        </div>
        {(error || googleError) && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
            {error || 'Google sign-in could not be completed. Please try again.'}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Login'}</Button>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />or<span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>
        <GoogleAuthButton redirectTo={redirectTo} />
        <p className="text-sm text-gray-600 dark:text-gray-300">No account? <Link className="text-indigo-600 hover:underline" to="/register">Create one</Link></p>
      </form>
    </div>
  )
}

