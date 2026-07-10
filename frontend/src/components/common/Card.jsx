import React from 'react'

export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 ${className}`}>
      {title && <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">{title}</h3>}
      {children}
    </div>
  )
}
