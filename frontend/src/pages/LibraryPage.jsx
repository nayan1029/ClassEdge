import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Download, FileText, Plus, Trash2, UploadCloud } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'
import { libraryApi } from '../api/libraryApi'
import { sessionService } from '../services/session'

export default function LibraryPage() {
  const user = sessionService.getUser()
  const canUpload = user?.role === 'TEACHER' || user?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ title: '', subject: '', description: '', file: null })
  const query = useQuery({ queryKey: ['library'], queryFn: libraryApi.list })
  const upload = useMutation({
    mutationFn: libraryApi.upload,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['library'] }); setFormOpen(false); setForm({ title: '', subject: '', description: '', file: null }) },
  })
  const remove = useMutation({ mutationFn: libraryApi.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library'] }) })
  const download = async (module) => {
    const blob = await libraryApi.download(module.id)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = module.fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  if (query.isLoading) return <Loader text="Loading learning library" />
  return <div className="space-y-6 text-slate-900 dark:text-slate-100">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Learning Library</h1><p className="mt-1 text-sm text-slate-500">Class modules and study materials shared by teachers.</p></div>{canUpload && <Button onClick={() => setFormOpen(!formOpen)}><span className="inline-flex items-center gap-2"><Plus size={16}/> Upload module</span></Button>}</header>
    {formOpen && canUpload && <Card title="Add a learning module"><form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); const data = new FormData(); data.append('title', form.title); data.append('subject', form.subject); data.append('description', form.description); data.append('file', form.file); upload.mutate(data) }}><label className="text-sm">Title<input required maxLength={120} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/></label><label className="text-sm">Subject<input maxLength={100} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}/></label><label className="text-sm md:col-span-2">Description<textarea maxLength={1000} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/></label><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-blue-300 p-4 text-sm md:col-span-2"><UploadCloud className="text-blue-600" size={20}/><span className="flex-1">{form.file?.name || 'Choose PDF, slides, or another module file (15 MB max)'}</span><input type="file" className="max-w-44 text-xs" required onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}/></label><div className="flex items-center gap-2 md:col-span-2"><Button type="submit" disabled={upload.isPending || !form.file}>{upload.isPending ? 'Uploading…' : 'Publish module'}</Button><Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button></div>{upload.error && <p className="text-sm text-red-600 md:col-span-2">{upload.error.response?.data?.message || 'Upload failed. Try a smaller file.'}</p>}</form></Card>}
    {!query.data?.length ? <Card><div className="py-8 text-center"><BookOpen size={28} className="mx-auto text-slate-400"/><p className="mt-3 font-medium">No modules shared yet</p><p className="mt-1 text-sm text-slate-500">Teachers can upload class material here for students to read.</p></div></Card> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{query.data.map((module) => <Card key={module.id} className="flex h-full flex-col"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><FileText size={19}/></span><div className="min-w-0 flex-1"><h2 className="font-semibold">{module.title}</h2><p className="mt-0.5 text-xs text-slate-500">{module.subject || 'General'} · by {module.teacherName}</p></div></div>{module.description && <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{module.description}</p>}<p className="mt-3 truncate text-xs text-slate-400">{module.fileName} · {new Date(module.uploadedAt).toLocaleDateString()}</p><div className="mt-auto flex gap-2 pt-4"><Button onClick={() => download(module)}><span className="inline-flex items-center gap-2"><Download size={15}/> Read / Download</span></Button>{canUpload && (user.role === 'ADMIN' || user.name === module.teacherName) && <button aria-label="Delete module" onClick={() => remove.mutate(module.id)} className="rounded-lg border border-slate-200 px-3 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button>}</div></Card>)}</div>}
  </div>
}
