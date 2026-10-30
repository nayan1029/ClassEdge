import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { classroomApi } from '../api/classroomApi'
import Card from '../components/common/Card'
import Loader from '../components/common/Loader'
import { Link } from 'react-router-dom'
import api from '../services/http'
import { sessionService } from '../services/session'

export default function StudentsPage() {
  const isAdmin = sessionService.getUser()?.role === 'ADMIN'
  const classes = useQuery({ queryKey: ['classrooms'], queryFn: classroomApi.list })
  const schoolDirectory = useQuery({ queryKey: ['school-students'], queryFn: async () => (await api.get('/school/students')).data, enabled: isAdmin })
  const rosterQuery = useQuery({
    queryKey: ['all-class-rosters', (classes.data || []).map((room) => room.id)],
    enabled: Boolean(classes.data) && !isAdmin,
    queryFn: async () => Promise.all((classes.data || []).map(async (room) => ({ room, students: (await classroomApi.roster(room.id)).filter((person) => person.role === 'STUDENT') }))),
  })
  if (classes.isLoading || rosterQuery.isLoading || schoolDirectory.isLoading) return <Loader text="Loading student directory"/>
  const entries = isAdmin
    ? (schoolDirectory.data || []).map((student) => ({ userId: student.id, name: student.name, email: student.email, classroom: 'School directory' }))
    : (rosterQuery.data || []).flatMap(({ room, students }) => students.map((student) => ({ ...student, classroom: room.name, classroomId: room.id })))
  return <div className="space-y-5 text-slate-900 dark:text-slate-100"><header><h1 className="text-2xl font-bold">Students</h1><p className="mt-1 text-sm text-slate-500">{isAdmin ? 'Student directory across the school.' : 'Student rosters across your classes.'}</p></header>{entries.length ? <Card><div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-sm"><thead><tr className="border-b text-xs text-slate-500"><th className="py-3">Student</th><th>Email</th><th>Class</th><th/></tr></thead><tbody>{entries.map((student, index) => <tr key={`${student.userId}-${student.classroomId || index}`} className="border-b border-slate-100 dark:border-slate-800"><td className="py-3 font-medium">{student.name}</td><td className="text-slate-500">{student.email}</td><td>{student.classroom}</td><td>{student.classroomId && <Link className="text-xs font-semibold text-blue-600" to={`/classes/${student.classroomId}`}>Open class</Link>}</td></tr>)}</tbody></table></div></Card> : <Card><div className="py-12 text-center"><Users className="mx-auto text-slate-400"/><p className="mt-3 font-medium">No students found</p><p className="mt-1 text-sm text-slate-500">Share a class code from My Classes to invite students.</p></div></Card>}</div>
}
