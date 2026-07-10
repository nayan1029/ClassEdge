import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Card from '../components/common/Card'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { tasksApi } from '../api/tasksApi'

export default function TasksPage() {
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const queryClient = useQueryClient()

  const query = useQuery({ queryKey: ['tasks'], queryFn: tasksApi.getAll })
  const createMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      setTitle('')
      setDeadline('')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Assignment & Task Manager</h1>
      <Card title="Add Task">
        <div className="grid md:grid-cols-3 gap-3">
          <Input label="Task" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <div className="flex items-end">
            <Button onClick={() => createMutation.mutate({ title, deadline })} disabled={!title || createMutation.isPending}>Add</Button>
          </div>
        </div>
      </Card>
      <Card title="Your Tasks">
        <ul className="space-y-2">
          {(query.data || []).map((task) => (
            <li key={task.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between">
              <span>{task.title}</span>
              <span className="text-xs text-gray-500">{task.deadline || 'No deadline'}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
