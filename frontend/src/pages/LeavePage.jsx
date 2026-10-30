import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Check, X } from 'lucide-react'
import api from '../services/http'
import { classroomApi } from '../api/classroomApi'
import { sessionService } from '../services/session'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'

export default function LeavePage() {
  const user = sessionService.getUser()
  const student = user?.role === 'STUDENT'
  const queryClient = useQueryClient()
  const [classroomId, setClassroomId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const classes = useQuery({ queryKey: ['classrooms'], queryFn: classroomApi.list, enabled: student })
  const requests = useQuery({ queryKey: ['leave-requests'], queryFn: async () => (await api.get('/school/leave-requests')).data })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
  const submit = useMutation({ mutationFn: () => api.post('/school/leave-requests', { classroomId: Number(classroomId), startDate, endDate, reason }), onSuccess: () => { setReason(''); refresh() } })
  const review = useMutation({ mutationFn: ({ id, status }) => api.patch(`/school/leave-requests/${id}`, { status }), onSuccess: refresh })
  if (requests.isLoading || (student && classes.isLoading)) return <Loader text="Loading leave requests"/>
  return <div className="space-y-5 text-slate-900 dark:text-slate-100"><header><h1 className="text-2xl font-bold">Leave Management</h1><p className="mt-1 text-sm text-slate-500">{student ? 'Request leave for one of your classes and track its status.' : 'Review leave requests submitted for your classes.'}</p></header>{student && <Card title="Request leave"><form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); submit.mutate() }}><label className="text-sm">Class<select required value={classroomId} onChange={(e) => setClassroomId(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"><option value="">Choose a class</option>{(classes.data || []).map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label><label className="text-sm">Reason<input required maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Brief reason"/></label><label className="text-sm">From<input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"/></label><label className="text-sm">Through<input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"/></label><div className="md:col-span-2"><Button type="submit" disabled={submit.isPending || !classroomId}>{submit.isPending ? 'Submitting…' : 'Submit request'}</Button></div></form>{submit.error && <p className="mt-2 text-sm text-red-600">{submit.error.response?.data?.message || 'Could not submit leave request.'}</p>}</Card>}<Card title={student ? 'My requests' : 'Requests to review'}><div className="divide-y divide-slate-100 dark:divide-slate-800">{requests.data?.length ? requests.data.map((request) => <div key={request.id} className="flex flex-wrap items-start justify-between gap-3 py-4"><div><div className="flex items-center gap-2"><h2 className="font-semibold">{request.studentName}</h2><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${request.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : request.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{request.status}</span></div><p className="mt-1 text-xs text-slate-500">{request.classroomName} · {request.startDate}{request.endDate !== request.startDate ? ` to ${request.endDate}` : ''}</p><p className="mt-2 text-sm">{request.reason}</p></div>{!student && request.status === 'PENDING' && <div className="flex gap-2"><button aria-label="Approve request" onClick={() => review.mutate({ id: request.id, status: 'APPROVED' })} className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><Check size={16}/></button><button aria-label="Reject request" onClick={() => review.mutate({ id: request.id, status: 'REJECTED' })} className="rounded-lg bg-red-50 p-2 text-red-700"><X size={16}/></button></div>}</div>) : <div className="py-10 text-center text-sm text-slate-500"><CalendarDays className="mx-auto mb-2"/>No leave requests yet.</div>}</div></Card></div>
}
