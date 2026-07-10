import React from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center">
      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            StudyBuddy for Smarter Learning
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            AI-powered dashboard for notes, quizzes, tasks, timetables, collaboration, and resume coaching.
          </p>
          <div className="flex gap-3">
            <Link className="px-5 py-3 rounded-lg bg-indigo-600 text-white" to="/register">Get Started</Link>
            <Link className="px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-700" to="/login">Login</Link>
          </div>
        </div>
        <div className="landing-card bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold mb-3">What you get</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>AI Notes Summarizer</li>
            <li>Quiz Generator with difficulty levels</li>
            <li>Smart timetable and task manager</li>
            <li>Study rooms and profile analytics</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
