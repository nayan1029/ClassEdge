import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Loader from '../components/common/Loader'
import { classroomApi } from '../api/classroomApi'
import { sessionService } from '../services/session'

export default function ClassroomsPage() {
  const user = sessionService.getUser()
  const isTeacher = user?.role === 'TEACHER'
  const queryClient = useQueryClient()

  const { data: classrooms = [], isLoading } = useQuery({ queryKey: ['classrooms'], queryFn: classroomApi.list })

  const [showForm, setShowForm] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', subject: '', section: '', description: '' })
  const [joinCode, setJoinCode] = useState('')

  const createMutation = useMutation({
    mutationFn: classroomApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      setShowForm(false)
      setCreateForm({ name: '', subject: '', section: '', description: '' })
    },
  })

  const joinMutation = useMutation({
    mutationFn: classroomApi.join,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      setShowForm(false)
      setJoinCode('')
    },
  })

  const errorMessage = createMutation.error?.response?.data?.message || joinMutation.error?.response?.data?.message

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Classes</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isTeacher ? 'Manage the classes you teach.' : 'Classes you have joined.'}
          </p>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Cancel' : isTeacher ? '+ Create Class' : '+ Join Class'}
        </Button>
      </div>

      {showForm && isTeacher && (
        <Card title="Create a new class">
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (!createForm.name.trim()) return
              createMutation.mutate(createForm)
            }}
          >
            <Input label="Class name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="e.g. Data Structures 101" required />
            <Input label="Subject" value={createForm.subject} onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })} placeholder="Computer Science" />
            <Input label="Section" value={createForm.section} onChange={(e) => setCreateForm({ ...createForm, section: e.target.value })} placeholder="Section A" />
            <Input label="Description" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} placeholder="Short description" />
            <div className="md:col-span-2">
              <Button type="submit" disabled={createMutation.isPending || !createForm.name.trim()}>
                {createMutation.isPending ? 'Creating...' : 'Create Class'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {showForm && !isTeacher && (
        <Card title="Join a class">
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              if (!joinCode.trim()) return
              joinMutation.mutate(joinCode.trim())
            }}
          >
            <Input label="Class code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="e.g. K7X9QP" required />
            <Button type="submit" disabled={joinMutation.isPending || !joinCode.trim()}>
              {joinMutation.isPending ? 'Joining...' : 'Join'}
            </Button>
          </form>
        </Card>
      )}

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {isLoading && <Loader text="Loading your classes" />}

      {!isLoading && classrooms.length === 0 && (
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isTeacher
              ? "You haven't created a class yet. Click \"+ Create Class\" to get started."
              : "You haven't joined a class yet. Ask your teacher for a class code and click \"+ Join Class\"."}
          </p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {classrooms.map((classroom) => (
          <Link key={classroom.id} to={`/classes/${classroom.id}`}>
            <Card title={classroom.name} className="h-full hover:ring-2 hover:ring-indigo-400 transition">
              {classroom.subject && <p className="text-sm text-gray-600 dark:text-gray-300">{classroom.subject}{classroom.section ? ` · ${classroom.section}` : ''}</p>}
              <p className="text-sm text-gray-500 mt-1">Taught by {classroom.teacherName}</p>
              <p className="text-sm text-gray-500">{classroom.memberCount} student{classroom.memberCount === 1 ? '' : 's'}</p>
              {classroom.myRole === 'TEACHER' && (
                <p className="mt-2 text-xs font-mono bg-gray-100 dark:bg-gray-800 inline-block px-2 py-1 rounded">
                  Code: {classroom.classCode}
                </p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
