import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { authApi } from '../api/authApi'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters')
      setStatus('error')
      return
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      await authApi.resetPassword(token, password)
      setStatus('done')
      setMessage('Password reset. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      setMessage(err.response?.data?.message || 'That reset link is invalid or has expired.')
      setStatus('error')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-800 space-y-3 text-center">
          <h1 className="text-xl font-semibold">Invalid Link</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This password reset link is missing its token. Request a new one below.
          </p>
          <Link className="text-indigo-600 hover:underline text-sm" to="/forgot-password">Request new link</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-800 space-y-4">
        <h1 className="text-xl font-semibold">Reset Password</h1>
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
        {message && (
          <div className={`p-3 rounded text-sm border ${status === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'}`}>
            {message}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={status === 'loading' || status === 'done'}>
          {status === 'loading' ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </div>
  )
}
