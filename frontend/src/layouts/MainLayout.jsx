import React from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { sessionService } from '../services/session'
import ThemeToggle from '../components/common/ThemeToggle'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/classes', label: 'Classes' },
  { to: '/notes', label: 'Notes' },
  { to: '/summarizer', label: 'Summarizer' },
  { to: '/assistant', label: 'Assistant' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/timetable', label: 'Timetable' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/resume', label: 'Resume' },
  { to: '/profile', label: 'Profile' },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const user = sessionService.getUser()

  const onLogout = () => {
    sessionService.clearSession()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 dark:text-gray-100">
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="font-bold text-lg text-indigo-600">StudyBuddy</Link>
          <div className="hidden lg:flex gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-indigo-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden md:block">{user?.name || 'Student'}</span>
            <ThemeToggle />
            <button
              onClick={onLogout}
              className="text-xs px-3 py-2 rounded-lg bg-red-600 text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800 py-4 text-center text-xs text-gray-500">
        StudyBuddy {new Date().getFullYear()} - AI productivity for students
      </footer>
    </div>
  )
}
