import React from 'react'

export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
      <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span>{text}</span>
    </div>
  )
}
