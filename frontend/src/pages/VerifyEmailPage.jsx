import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/authApi'
import Loader from '../components/common/Loader'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('This verification link is missing its token.')
      return
    }
    authApi.verifyEmail(token)
      .then((data) => {
        setStatus('done')
        setMessage(data.message)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'This verification link is invalid or has expired.')
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-800 space-y-3 text-center">
        <h1 className="text-xl font-semibold">Email Verification</h1>
        {status === 'loading' && <Loader text="Verifying your email..." />}
        {status !== 'loading' && (
          <p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
        )}
        <Link className="text-indigo-600 hover:underline text-sm inline-block" to="/dashboard">Go to dashboard</Link>
      </div>
    </div>
  )
}
