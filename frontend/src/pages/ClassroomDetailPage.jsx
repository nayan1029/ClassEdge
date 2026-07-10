import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Loader from '../components/common/Loader'
import ChatMarkdown from '../components/common/ChatMarkdown'
import RoomChat from '../components/rooms/RoomChat'
import RoomVideoCall from '../components/rooms/RoomVideoCall'
import { classroomApi } from '../api/classroomApi'
import { createChatClient } from '../services/chatClient'
import { sessionService } from '../services/session'

const TABS = ['Stream', 'Classwork', 'People', 'Meet']

export default function ClassroomDetailPage() {
  const { classroomId } = useParams()
  const id = Number(classroomId)
  const user = sessionService.getUser()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('Stream')

  const { data: classroom, isLoading } = useQuery({
    queryKey: ['classroom', id],
    queryFn: () => classroomApi.get(id),
  })

  const isTeacher = classroom?.myRole === 'TEACHER'

  // --- Stream ---
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', id],
    queryFn: () => classroomApi.listAnnouncements(id),
    enabled: activeTab === 'Stream',
  })
  const [announcementDraft, setAnnouncementDraft] = useState('')
  const postAnnouncement = useMutation({
    mutationFn: (content) => classroomApi.postAnnouncement(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', id] })
      setAnnouncementDraft('')
    },
  })

  // --- Classwork ---
  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', id],
    queryFn: () => classroomApi.listAssignments(id),
    enabled: activeTab === 'Classwork',
  })
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '', points: 100 })
  const createAssignment = useMutation({
    mutationFn: () => classroomApi.createAssignment(id, {
      ...assignmentForm,
      dueDate: assignmentForm.dueDate ? new Date(assignmentForm.dueDate).toISOString() : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', id] })
      setShowAssignmentForm(false)
      setAssignmentForm({ title: '', description: '', dueDate: '', points: 100 })
    },
  })

  // --- People ---
  const { data: roster = [] } = useQuery({
    queryKey: ['roster', id],
    queryFn: () => classroomApi.roster(id),
    enabled: activeTab === 'People',
  })

  // --- Meet (shared STOMP connection for chat + video signaling) ---
  const [chatClient, setChatClient] = useState(null)
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    if (activeTab !== 'Meet') return undefined
    const client = createChatClient({ onConnect: () => setConnected(true), onError: () => setConnected(false) })
    setChatClient(client)
    return () => client.deactivate()
  }, [activeTab])

  if (isLoading) return <Loader text="Loading class" />
  if (!classroom) return <p className="text-sm text-gray-500">Class not found.</p>

  return (
    <div className="space-y-6">
      <div>
        <Link to="/classes" className="text-sm text-indigo-600 hover:underline">&larr; Back to My Classes</Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-semibold">{classroom.name}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {classroom.subject}{classroom.section ? ` · ${classroom.section}` : ''} · Taught by {classroom.teacherName}
            </p>
          </div>
          {isTeacher && (
            <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
              Class code: <span className="font-semibold">{classroom.classCode}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Stream' && (
        <div className="space-y-4">
          <Card>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault()
                if (!announcementDraft.trim()) return
                postAnnouncement.mutate(announcementDraft.trim())
              }}
            >
              <textarea
                className="w-full min-h-20 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Share something with your class..."
                value={announcementDraft}
                onChange={(e) => setAnnouncementDraft(e.target.value)}
              />
              <Button type="submit" disabled={postAnnouncement.isPending || !announcementDraft.trim()}>
                {postAnnouncement.isPending ? 'Posting...' : 'Post'}
              </Button>
            </form>
          </Card>

          {announcements.length === 0 && <p className="text-sm text-gray-500">No announcements yet.</p>}
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <div className="flex items-baseline justify-between mb-2">
                <p className="font-semibold text-sm">{announcement.authorName}</p>
                <p className="text-xs text-gray-500">{new Date(announcement.createdAt).toLocaleString()}</p>
              </div>
              <ChatMarkdown content={announcement.content} />
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'Classwork' && (
        <div className="space-y-4">
          {isTeacher && (
            <div className="flex justify-end">
              <Button onClick={() => setShowAssignmentForm((prev) => !prev)}>
                {showAssignmentForm ? 'Cancel' : '+ Create Assignment'}
              </Button>
            </div>
          )}

          {showAssignmentForm && (
            <Card title="New Assignment">
              <form
                className="grid gap-3 md:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!assignmentForm.title.trim()) return
                  createAssignment.mutate()
                }}
              >
                <Input label="Title" value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} required placeholder="e.g. Homework 1: Arrays" />
                <Input label="Points" type="number" value={assignmentForm.points} onChange={(e) => setAssignmentForm({ ...assignmentForm, points: Number(e.target.value) })} />
                <Input label="Due date" type="datetime-local" value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full min-h-24 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={createAssignment.isPending || !assignmentForm.title.trim()}>
                    {createAssignment.isPending ? 'Creating...' : 'Assign'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {assignments.length === 0 && <p className="text-sm text-gray-500">No assignments yet.</p>}
          {assignments.map((assignment) => (
            <Link key={assignment.id} to={`/assignments/${assignment.id}?classroomId=${id}`}>
              <Card className="hover:ring-2 hover:ring-indigo-400 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{assignment.title}</p>
                    <p className="text-xs text-gray-500">
                      {assignment.points} points{assignment.dueDate ? ` · Due ${new Date(assignment.dueDate).toLocaleString()}` : ''}
                    </p>
                  </div>
                  {isTeacher ? (
                    <p className="text-sm text-gray-500">{assignment.submittedCount}/{assignment.totalStudents} submitted</p>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      assignment.mySubmissionStatus === 'GRADED' ? 'bg-green-100 text-green-700' :
                      assignment.mySubmissionStatus === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {assignment.mySubmissionStatus === 'GRADED' ? `Graded: ${assignment.myGrade}/${assignment.points}` : assignment.mySubmissionStatus}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'People' && (
        <Card>
          <div className="space-y-3">
            {roster.map((member) => (
              <div key={member.userId} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${member.role === 'TEACHER' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                  {member.role === 'TEACHER' ? 'Teacher' : 'Student'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'Meet' && classroom.roomId && (
        <Card title="Class Chat & Video">
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Chat</h4>
              <RoomChat room={{ id: classroom.roomId, name: classroom.name }} chatClient={chatClient} connected={connected} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Video Call</h4>
              <RoomVideoCall room={{ id: classroom.roomId, name: classroom.name }} chatClient={chatClient} connected={connected} />
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
