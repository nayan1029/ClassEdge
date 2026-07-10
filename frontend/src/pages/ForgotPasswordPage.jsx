import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { authApi } from '../api/authApi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    try {
      const data = await authApi.forgotPassword(email)
      setMessage(data.message)
      setStatus('done')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-800 space-y-4">
        <h1 className="text-xl font-semibold">Forgot Password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Enter your account email and we'll send you a link to reset your password.
        </p>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="student@example.com"
        />
        {message && (
          <div className={`p-3 rounded text-sm border ${status === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'}`}>
            {message}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
        </Button>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <Link className="text-indigo-600 hover:underline" to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  )
}
