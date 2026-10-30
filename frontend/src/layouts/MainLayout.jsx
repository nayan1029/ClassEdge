import React, { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { sessionService } from '../services/session'
import ThemeToggle from '../components/common/ThemeToggle'
import {
  LayoutDashboard, Users, BookOpen, FileText, Bot, BrainCircuit, CheckSquare,
  CalendarDays, User, LogOut, Menu, X, GraduationCap, MessageCircle, Library, ClipboardList, Settings, Wallet, CalendarCheck,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/classes', label: 'My Classes', icon: Users },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/lesson-plans', label: 'Lesson Plans', icon: FileText },
  { to: '/classes', label: 'Assignments', icon: ClipboardList },
  { to: '/quiz', label: 'AI Quiz Builder', icon: BrainCircuit },
  { to: '/classes', label: 'Results & Grades', icon: CheckSquare },
  { to: '/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/classes', label: 'Homework', icon: BookOpen },
  { to: '/communication', label: 'Communication', icon: MessageCircle },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/dashboard', label: 'Reports & Analytics', icon: LayoutDashboard },
  { to: '/leave', label: 'Leave Management', icon: CalendarDays },
  { to: '/fees', label: 'Fees (View)', icon: Wallet },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/notes', label: 'Notes', icon: BookOpen },
  { to: '/summarizer', label: 'AI Summarizer', icon: FileText },
  { to: '/assistant', label: 'Study Assistant', icon: Bot },
  { to: '/profile', label: 'Settings', icon: Settings },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = sessionService.getUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  useEffect(() => setIsMobileMenuOpen(false), [location.pathname])

  const logout = () => { sessionService.clearSession(); navigate('/login') }
  const Sidebar = () => <div className="flex h-full flex-col bg-white dark:bg-slate-950">
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800"><Link to="/dashboard" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20"><GraduationCap size={22}/></span><span><span className="block text-base font-bold tracking-tight text-slate-900 dark:text-white">ClassEdge</span><span className="block text-[10px] font-medium uppercase tracking-widest text-slate-400">Learning workspace</span></span></Link><button className="text-slate-400 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close navigation"><X size={20}/></button></div>
    <div className="px-4 pb-2 pt-5"><p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p></div>
    <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-1">{navItems.filter(({ label }) => {
      if (label === 'Students') return user?.role === 'TEACHER' || user?.role === 'ADMIN'
      if (label === 'Fees (View)') return user?.role === 'STUDENT' || user?.role === 'ADMIN'
      return true
    }).map(({ to, label, icon: Icon }) => <NavLink key={`${label}-${to}`} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition ${isActive ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'}`}><Icon size={18}/>{label}</NavLink>)}</nav>
    <div className="border-t border-slate-100 p-3 dark:border-slate-800"><Link to="/profile" className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-900"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">{user?.name?.charAt(0) || 'S'}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800 dark:text-white">{user?.name || 'Student'}</span><span className="block truncate text-[10px] text-slate-500">{user?.role === 'TEACHER' ? 'Teacher' : 'Student'}</span></span><User size={16} className="text-slate-400"/></Link><div className="flex items-center gap-2"><ThemeToggle/><button onClick={logout} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-300"><LogOut size={14}/> Sign out</button></div></div>
  </div>

  return <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:block"><Sidebar/></aside>
    {isMobileMenuOpen && <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}/>}
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 shadow-2xl transition-transform lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}><Sidebar/></aside>
    <div className="flex min-w-0 flex-1 flex-col"><header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:px-7"><div className="flex items-center gap-3"><button aria-label="Open navigation" onClick={() => setIsMobileMenuOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden"><Menu size={19}/></button><span className="text-xs text-slate-400">Workspace <span className="px-1">/</span> <span className="font-medium text-slate-700 dark:text-slate-200">{navItems.find((item) => location.pathname.startsWith(item.to))?.label || 'Classroom'}</span></span></div><div className="flex items-center gap-3"><span className="hidden text-xs text-slate-400 sm:inline">Learn at your pace</span><ThemeToggle/></div></header><main className="flex-1 overflow-y-auto"><div className="mx-auto w-full max-w-[1440px] p-4 md:p-6 lg:p-7"><Outlet/></div></main></div>
    <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(148,163,184,.35);border-radius:4px}` }}/>
  </div>
}
