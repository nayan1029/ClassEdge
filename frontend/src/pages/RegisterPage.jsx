import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import GoogleAuthButton from '../components/common/GoogleAuthButton'
import { authApi } from '../api/authApi'
import { sessionService } from '../services/session'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const validateForm = () => {
    if (!form.name || form.name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return false
    }
    if (form.name.length > 50) {
      setError('Name must be less than 50 characters')
      return false
    }
    if (!form.email || !form.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (form.password.length > 100) {
      setError('Password must be less than 100 characters')
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
      const data = await authApi.register(form)
      sessionService.saveSession(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      const errorData = err.response?.data
      if (errorData?.errors) {
        const fieldErrors = Object.entries(errorData.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(' | ')
        setError(fieldErrors)
      } else {
        setError(errorData?.message || 'Registration failed')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-800 space-y-4">
        <h1 className="text-xl font-semibold">Create Account</h1>
        <Input 
          label="Full Name" 
          value={form.name} 
          onChange={(e) => setForm({ ...form, name: e.target.value })} 
          required 
          placeholder="John Doe"
        />
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'STUDENT', label: 'Student' },
              { value: 'TEACHER', label: 'Teacher' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setForm({ ...form, role: option.value })}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  form.role === option.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                    : 'border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
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
        {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">{error}</div>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Register'}</Button>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />or<span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>
        <GoogleAuthButton label="Sign up with Google" />
        <p className="text-sm text-gray-600 dark:text-gray-300">Already have account? <Link className="text-indigo-600 hover:underline" to="/login">Sign in</Link></p>
      </form>
    </div>
  )
}
