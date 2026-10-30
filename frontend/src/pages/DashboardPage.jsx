import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboardApi'
import { classroomApi } from '../api/classroomApi'
import { timetableApi } from '../api/timetableApi'
import api from '../services/http'
import { sessionService } from '../services/session'
import Loader from '../components/common/Loader'
import FlashCard from '../components/common/FlashCard'
import {
  ArrowUpRight, Bell, BookOpen, Bot, BrainCircuit, CalendarDays, CheckSquare,
  ChevronLeft, ChevronRight, ClipboardList, FileText, GraduationCap,
  LayoutDashboard, Sparkles, Users, Library, MessageCircle, CalendarCheck,
} from 'lucide-react'

const studyCards = [
  { subject: 'Data Structures', question: 'What is the time complexity of Binary Search?', answer: 'O(log n): each step halves the remaining search space.', color: 'bg-blue-600' },
  { subject: 'Algorithms', question: 'What does Big O notation describe?', answer: 'How an algorithm’s time or space use grows as the input gets larger.', color: 'bg-violet-600' },
  { subject: 'Databases', question: 'What is a primary key?', answer: 'A column, or set of columns, that uniquely identifies each row in a table.', color: 'bg-emerald-600' },
]

const modules = [
  { label: 'My Classes', to: '/classes', icon: Users, tint: 'blue' },
  { label: 'Assignments', to: '/classes', icon: ClipboardList, tint: 'violet' },
  { label: 'Study Assistant', to: '/assistant', icon: Bot, tint: 'cyan' },
  { label: 'Quiz Generator', to: '/quiz', icon: BrainCircuit, tint: 'amber' },
  { label: 'Notes Library', to: '/notes', icon: BookOpen, tint: 'green' },
  { label: 'Timetable', to: '/timetable', icon: CalendarDays, tint: 'rose' },
  { label: 'Library', to: '/library', icon: Library, tint: 'blue' },
  { label: 'Class Chat', to: '/communication', icon: MessageCircle, tint: 'cyan' },
  { label: 'Attendance', to: '/attendance', icon: CalendarCheck, tint: 'amber' },
  { label: 'Lesson Plans', to: '/lesson-plans', icon: FileText, tint: 'violet' },
]

const tintClasses = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
  cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
}

function Panel({ title, action, children, className = '' }) {
  return <section className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>{action}</div>{children}
  </section>
}

export default function DashboardPage() {
  const user = sessionService.getUser()
  const [cardIndex, setCardIndex] = useState(0)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.fetchDashboard })
  const { data: classrooms = [], isLoading: classesLoading } = useQuery({ queryKey: ['classrooms'], queryFn: classroomApi.list })
  const isTeacher = user?.role === 'TEACHER'
  const { data: timetable = [] } = useQuery({ queryKey: ['timetable'], queryFn: timetableApi.get })
  const { data: teacherMetrics = {} } = useQuery({
    queryKey: ['dashboard-teacher-metrics', classrooms.map((item) => item.id)],
    enabled: isTeacher && classrooms.length > 0,
    queryFn: async () => {
      const assignmentsByClass = await Promise.all(classrooms.map((room) => classroomApi.listAssignments(room.id)))
      const assignments = assignmentsByClass.flat()
      const submissions = await Promise.all(assignments.map((item) => classroomApi.listSubmissions(item.id)))
      const leaveRequests = (await api.get('/school/leave-requests')).data
      return {
        studentCount: classrooms.reduce((sum, room) => sum + (room.memberCount || 0), 0),
        pendingGrading: submissions.flat().filter((item) => item.status === 'SUBMITTED').length,
        pendingLeave: leaveRequests.filter((item) => item.status === 'PENDING').length,
      }
    },
  })
  const stats = dashboard?.stats || {}
  const myClasses = useMemo(() => classrooms.slice(0, 4), [classrooms])
  const todaysSessions = timetable.filter((row) => row.day?.toLowerCase() === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())
  const card = studyCards[cardIndex]

  if (dashboardLoading || classesLoading) return <Loader text="Preparing your learning dashboard" />

  const statCards = [
    { label: isTeacher ? "Today's study sessions" : 'My classes', value: isTeacher ? todaysSessions.length : (stats.classCount ?? classrooms.length), icon: GraduationCap, tint: 'blue', hint: 'Learning spaces' },
    { label: isTeacher ? 'Student count' : 'Assignments', value: isTeacher ? (teacherMetrics.studentCount ?? classrooms.reduce((sum, room) => sum + (room.memberCount || 0), 0)) : (stats.assignmentCount ?? '—'), icon: isTeacher ? Users : ClipboardList, tint: 'violet', hint: isTeacher ? 'Across your classes' : 'Across your classes' },
    { label: isTeacher ? 'To grade' : 'Tasks completed', value: isTeacher ? (teacherMetrics.pendingGrading ?? '—') : (stats.completedTasks ?? 0), icon: CheckSquare, tint: 'green', hint: isTeacher ? 'Student submissions' : `${stats.pendingTasks ?? 0} still in progress` },
    { label: isTeacher ? 'Leave requests' : 'Study notes', value: isTeacher ? (teacherMetrics.pendingLeave ?? '—') : (stats.notesCount ?? 0), icon: isTeacher ? CalendarDays : BookOpen, tint: 'amber', hint: isTeacher ? 'Awaiting your review' : 'Saved in your library' },
  ]

  return <div className="space-y-5 pb-8 text-slate-900 dark:text-slate-100">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-sm font-medium text-blue-600 dark:text-blue-300">ClassEdge learning workspace</p><h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{isTeacher ? 'Teacher Dashboard' : 'Student Dashboard'}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your classes, assignments, and study tools in one place.</p></div>
      <div className="flex items-center gap-2"><button aria-label="Notifications" className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 dark:border-slate-800 dark:bg-slate-900"><Bell size={18}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500"/></button><Link to="/profile" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 dark:border-slate-800 dark:bg-slate-900"><span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-sm font-semibold text-white">{user?.name?.charAt(0) || 'S'}</span><span className="text-left"><span className="block text-xs font-semibold">{user?.name || 'Student'}</span><span className="block text-[10px] text-slate-500">{isTeacher ? 'Teacher' : 'Student'}</span></span></Link></div>
    </header>

    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-6 text-white shadow-lg shadow-blue-900/10 md:p-8">
      <div className="relative z-10 max-w-2xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium"><Sparkles size={14}/> Your learning, organized</div><h2 className="text-2xl font-bold md:text-3xl">Good day, {user?.name?.split(' ')[0] || (isTeacher ? 'Teacher' : 'Student')} <span aria-hidden="true">✦</span></h2><p className="mt-2 max-w-lg text-sm leading-6 text-blue-50">{classrooms.length ? `You’re connected to ${classrooms.length} ${classrooms.length === 1 ? 'class' : 'classes'}. Pick up where you left off.` : 'Create a class or join one with a class code to get started.'}</p><Link to={isTeacher ? '/classes' : '/classes'} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50">View my classes <ArrowUpRight size={16}/></Link></div>
      <div className="pointer-events-none absolute -right-5 -top-20 h-64 w-64 rounded-full border-[32px] border-white/10 md:right-12 md:top-[-100px] md:h-80 md:w-80"/><div className="pointer-events-none absolute bottom-[-100px] right-48 h-48 w-48 rounded-full bg-cyan-300/20 blur-2xl"/>
    </div>

    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{statCards.map(({ label, value, icon: Icon, tint, hint }) => <div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div><span className={`grid h-10 w-10 place-items-center rounded-xl ${tintClasses[tint]}`}><Icon size={19}/></span></div><p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{hint}</p></div>)}</div>

    <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr_0.8fr]">
      <Panel title="Quick access" action={<span className="text-xs text-slate-400">Your study tools</span>}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{modules.map(({ label, to, icon: Icon, tint }) => <Link key={label} to={to} className="group rounded-2xl border border-slate-100 p-3 transition hover:border-blue-200 hover:shadow-sm dark:border-slate-800 dark:hover:border-blue-800"><span className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${tintClasses[tint]}`}><Icon size={19}/></span><span className="block text-xs font-semibold">{label}</span><span className="mt-1 block text-[10px] text-slate-400">Open tool <ArrowUpRight className="inline" size={12}/></span></Link>)}</div>
      </Panel>
      <Panel title="Daily study card" action={<div className="flex items-center gap-1"><button aria-label="Previous card" onClick={() => setCardIndex((cardIndex + studyCards.length - 1) % studyCards.length)} className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft size={16}/></button><span className="text-[10px] text-slate-400">{cardIndex + 1}/{studyCards.length}</span><button aria-label="Next card" onClick={() => setCardIndex((cardIndex + 1) % studyCards.length)} className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight size={16}/></button></div>}>
        <span className="mb-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{card.subject}</span><FlashCard className="h-36" frontClass={`${card.color} text-white`} backClass="border border-blue-100 bg-blue-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white" front={<p className="px-4 text-center text-sm font-semibold">{card.question}</p>} back={<p className="px-4 text-center text-sm">{card.answer}</p>}/><p className="mt-2 text-center text-[10px] text-slate-400">Select the card to reveal the answer</p>
      </Panel>
      <Panel title="Study assistant" className="bg-gradient-to-b from-violet-50 to-white dark:from-violet-950/30 dark:to-slate-900"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"><Bot size={22}/></span><h3 className="mt-4 text-sm font-semibold">Need help with a topic?</h3><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Ask a question, get an explanation, or make a quick revision plan.</p><Link to="/assistant" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700">Chat with assistant <ArrowUpRight size={14}/></Link></Panel>
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr_0.72fr]">
      <Panel title="My classes" action={<Link to="/classes" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all</Link>}>
        {myClasses.length ? <div className="grid gap-3 sm:grid-cols-2">{myClasses.map((item) => <Link key={item.id} to={`/classes/${item.id}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-blue-200 dark:border-slate-800 dark:hover:border-blue-800"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><BookOpen size={18}/></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{item.name}</span><span className="block truncate text-xs text-slate-500">{[item.subject, item.section].filter(Boolean).join(' · ') || 'Class workspace'}</span></span><ArrowUpRight size={15} className="text-slate-400"/></Link>)}</div> : <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center dark:border-slate-700"><p className="text-sm font-medium">No classes yet</p><p className="mt-1 text-xs text-slate-500">Join a class or create one to see your classroom activity here.</p><Link to="/classes" className="mt-3 inline-flex text-xs font-semibold text-blue-600">Go to classes <ArrowUpRight size={13}/></Link></div>}
      </Panel>
      <div className="space-y-5">
        <Panel title="Calendar" action={<div className="flex gap-1"><button aria-label="Previous month" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}><ChevronLeft size={16}/></button><button aria-label="Next month" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}><ChevronRight size={16}/></button></div>}>
          <p className="mb-3 text-center text-sm font-semibold">{calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p><div className="grid grid-cols-7 gap-y-2 text-center text-[10px] text-slate-400">{['S','M','T','W','T','F','S'].map((day, index) => <span key={`${day}-${index}`} className="py-1 font-semibold">{day}</span>)}{Array.from({ length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() }, (_, index) => <span key={`empty-${index}`}/>)}{Array.from({ length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate() }, (_, index) => { const day = index + 1; const now = new Date(); const selected = day === now.getDate() && calendarMonth.getMonth() === now.getMonth() && calendarMonth.getFullYear() === now.getFullYear(); return <span key={day} className={`mx-auto grid h-7 w-7 place-items-center rounded-full ${selected ? 'bg-blue-600 font-bold text-white' : 'text-slate-600 dark:text-slate-300'}`}>{day}</span> })}</div>
        </Panel>
        <Panel title="Today's study plan" action={<Link to="/timetable" className="text-[10px] font-semibold text-blue-600">View timetable</Link>}><div className="space-y-2">{todaysSessions.length ? todaysSessions.map((row) => <div key={row.id || `${row.day}-${row.subject}`} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800"><p className="text-[10px] font-semibold text-blue-600">{row.time || row.slot}</p><p className="mt-1 text-xs font-semibold">{row.subject}</p><p className="mt-0.5 text-[10px] text-slate-500">{row.focus || 'Study session'}</p></div>) : <p className="py-4 text-center text-xs text-slate-500">No sessions planned for today.</p>}</div></Panel>
      </div>
    </div>
  </div>
}
