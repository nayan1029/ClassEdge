import React from 'react'

export default function Button({
  children,
  type = 'button',
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
}) {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
