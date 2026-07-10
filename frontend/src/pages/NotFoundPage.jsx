import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">Page not found.</p>
      <Link to="/dashboard" className="px-4 py-2 bg-indigo-600 rounded-lg text-white">Go to Dashboard</Link>
    </div>
  )
}
