import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Card from '../components/common/Card'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'
import { notesApi } from '../api/notesApi'

export default function NotesPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const queryClient = useQueryClient()

  const notesQuery = useQuery({ queryKey: ['notes'], queryFn: notesApi.getAll })
  const createMutation = useMutation({
    mutationFn: notesApi.create,
    onSuccess: () => {
      setTitle('')
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  const onSubmit = (event) => {
    event.preventDefault()
    createMutation.mutate({ title, content })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Notes Management</h1>
      <Card title="Create Note">
        <form onSubmit={onSubmit} className="space-y-3">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea
            className="w-full min-h-24 px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your notes"
            required
          />
          <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Saving...' : 'Save Note'}</Button>
        </form>
      </Card>
      <Card title="Recent Notes">
        {notesQuery.isLoading ? <Loader text="Loading notes" /> : (
          <div className="space-y-3">
            {(notesQuery.data || []).map((note) => (
              <div key={note.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="font-medium">{note.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
