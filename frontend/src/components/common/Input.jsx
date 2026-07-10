import React, { useState } from 'react'

export default function Input({ label, error, className = '', type, showPassword, onTogglePassword, ...props }) {
  const [internalShowPassword, setInternalShowPassword] = useState(false)
  
  const isPassword = type === 'password'
  const showPwd = showPassword !== undefined ? showPassword : internalShowPassword
  const togglePwd = onTogglePassword || (() => setInternalShowPassword(!internalShowPassword))
  const inputType = isPassword && showPwd ? 'text' : type

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={`w-full px-3 py-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isPassword ? 'pr-10' : ''} ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePwd}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            tabIndex={-1}
          >
            {showPwd ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19 12 19s8.774-2.662 10.065-7c-1.291-4.338-5.309-7-10.065-7S3.226 7.662 1.934 12zm10.025-5.376a3 3 0 112.828 2.828 3 3 0 01-2.828-2.828zm0 5.376a3 3 0 11-2.828-2.828 3 3 0 012.828 2.828z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
