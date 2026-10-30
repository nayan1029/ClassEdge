import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarCheck, Save } from 'lucide-react'
import api from '../services/http'
import { classroomApi } from '../api/classroomApi'
import { sessionService } from '../services/session'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'

const today = (() => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` })()
const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']

export default function AttendancePage() {
  const [classroomId, setClassroomId] = useState('')
  const [date, setDate] = useState(today)
  const [marks, setMarks] = useState({})
  const user = sessionService.getUser()
  const queryClient = useQueryClient()
  const classrooms = useQuery({ queryKey: ['classrooms'], queryFn: classroomApi.list })
  const selected = useMemo(() => (classrooms.data || []).find((row) => String(row.id) === String(classroomId)), [classrooms.data, classroomId])
  const roster = useQuery({ queryKey: ['roster', classroomId], queryFn: () => classroomApi.roster(Number(classroomId)), enabled: Boolean(classroomId) })
  const key = ['attendance', classroomId, date]
  const attendance = useQuery({ queryKey: key, queryFn: async () => (await api.get(`/classrooms/${classroomId}/attendance`, { params: { date } })).data, enabled: Boolean(classroomId) })
  useEffect(() => {
    if (!attendance.data) return
    setMarks(Object.fromEntries(attendance.data.map((row) => [row.studentId, row.status])))
  }, [attendance.data])
  const save = useMutation({ mutationFn: async () => (await api.put(`/classrooms/${classroomId}/attendance`, { date, entries: (roster.data || []).filter((row) => row.role === 'STUDENT').map((row) => ({ studentId: row.userId, status: marks[row.userId] })) })).data, onSuccess: (data) => queryClient.setQueryData(key, data) })

  if (classrooms.isLoading) return <Loader text="Loading classes" />
  const students = (roster.data || []).filter((row) => row.role === 'STUDENT')
  const isTeacher = selected?.myRole === 'TEACHER'
  return <div className="space-y-5 text-slate-900 dark:text-slate-100"><header><h1 className="text-2xl font-bold">Attendance</h1><p className="mt-1 text-sm text-slate-500">{user?.role === 'TEACHER' ? 'Take and review attendance for your classes.' : 'Review your attendance records by class and date.'}</p></header><Card><div className="flex flex-wrap items-end gap-4"><label className="text-sm font-medium">Class<select value={classroomId} onChange={(e) => setClassroomId(e.target.value)} className="mt-1 block min-w-56 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"><option value="">Choose a class</option>{(classrooms.data || []).map((row) => <option value={row.id} key={row.id}>{row.name}</option>)}</select></label><label className="text-sm font-medium">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"/></label>{isTeacher && <Button disabled={save.isPending || students.length === 0 || students.some((row) => !marks[row.userId])} onClick={() => save.mutate()}><span className="inline-flex items-center gap-2"><Save size={15}/>{save.isPending ? 'Saving…' : 'Save attendance'}</span></Button>}</div></Card>{!classroomId ? <Card><div className="py-12 text-center"><CalendarCheck className="mx-auto text-slate-400"/><p className="mt-3 text-sm text-slate-500">Select a class to view attendance.</p></div></Card> : roster.isLoading || attendance.isLoading ? <Loader text="Loading attendance"/> : !isTeacher ? <Card title={`${selected?.name} · ${date}`}><div className="space-y-3">{(attendance.data || []).length ? attendance.data.map((row) => <div className="flex justify-between border-b border-slate-100 py-2 text-sm dark:border-slate-800" key={row.studentId}><span>{row.date}</span><span className={`font-semibold ${row.status === 'PRESENT' ? 'text-emerald-600' : row.status === 'ABSENT' ? 'text-red-600' : 'text-amber-600'}`}>{row.status}</span></div>) : <p className="py-6 text-center text-sm text-slate-500">No attendance has been recorded for this date.</p>}</div></Card> : <Card title={`${selected?.name} · ${date}`}><div className="divide-y divide-slate-100 dark:divide-slate-800">{students.length ? students.map((student) => <div key={student.userId} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{student.name}</p><p className="text-xs text-slate-500">{student.email}</p></div><div className="flex gap-1">{STATUSES.map((status) => <button key={status} onClick={() => setMarks((current) => ({ ...current, [student.userId]: status }))} className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold ${marks[student.userId] === status ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-500 dark:border-slate-700'}`}>{status}</button>)}</div></div>) : <p className="py-8 text-center text-sm text-slate-500">This class has no enrolled students yet.</p>}</div>{save.error && <p className="mt-3 text-sm text-red-600">{save.error.response?.data?.message || 'Attendance could not be saved.'}</p>}</Card>}</div>
}
