import React, { useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'
import ChatMarkdown from '../components/common/ChatMarkdown'
import { classroomApi } from '../api/classroomApi'

// Assignments are only exposed via the classroom's assignment list endpoint
// (no standalone GET /api/assignments/:id on the backend), so this page resolves
// the assignment by fetching that list using the classroomId carried in the URL
// query string (set by the link on ClassroomDetailPage's Classwork tab).
export default function AssignmentDetailPage() {
  const { assignmentId } = useParams()
  const [searchParams] = useSearchParams()
  const classroomIdFromQuery = searchParams.get('classroomId')
  const id = Number(assignmentId)
  const queryClient = useQueryClient()

  const { data: assignmentsInClass = [], isLoading: loadingList } = useQuery({
    queryKey: ['assignments', classroomIdFromQuery],
    queryFn: () => classroomApi.listAssignments(Number(classroomIdFromQuery)),
    enabled: Boolean(classroomIdFromQuery),
  })

  const resolved = assignmentsInClass.find((item) => item.id === id)
  const isTeacher = resolved?.submittedCount !== undefined

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions', id],
    queryFn: () => classroomApi.listSubmissions(id),
    enabled: Boolean(isTeacher),
  })

  const [submissionDraft, setSubmissionDraft] = useState('')
  const submitMutation = useMutation({
    mutationFn: () => classroomApi.submitAssignment(id, submissionDraft.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', classroomIdFromQuery] })
      setSubmissionDraft('')
    },
  })

  const [gradeDrafts, setGradeDrafts] = useState({})
  const gradeMutation = useMutation({
    mutationFn: ({ submissionId, grade, feedback }) => classroomApi.gradeSubmission(submissionId, { grade, feedback }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submissions', id] }),
  })

  if (loadingList) return <Loader text="Loading assignment" />

  if (!resolved) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500">
          Assignment not found. Open it from the class's Classwork tab instead of a direct link.
        </p>
        <Link to="/classes" className="text-indigo-600 hover:underline text-sm">&larr; Back to My Classes</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link to={`/classes/${resolved.classroomId}`} className="text-sm text-indigo-600 hover:underline">&larr; Back to class</Link>

      <Card>
        <h1 className="text-xl font-semibold">{resolved.title}</h1>
        <p className="text-sm text-gray-500 mb-3">
          {resolved.points} points{resolved.dueDate ? ` · Due ${new Date(resolved.dueDate).toLocaleString()}` : ' · No due date'}
        </p>
        {resolved.description && <ChatMarkdown content={resolved.description} />}
      </Card>

      {!isTeacher && (
        <Card title="Your Submission">
          {resolved.mySubmissionStatus === 'GRADED' ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-green-700">Graded: {resolved.myGrade}/{resolved.points}</p>
              {resolved.myFeedback && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Teacher feedback</p>
                  <ChatMarkdown content={resolved.myFeedback} />
                </div>
              )}
            </div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault()
                if (!submissionDraft.trim()) return
                submitMutation.mutate()
              }}
            >
              <textarea
                className="w-full min-h-32 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Type your answer, or paste a link to your work..."
                value={submissionDraft}
                onChange={(e) => setSubmissionDraft(e.target.value)}
              />
              <Button type="submit" disabled={submitMutation.isPending || !submissionDraft.trim()}>
                {submitMutation.isPending ? 'Submitting...' : resolved.mySubmissionStatus === 'SUBMITTED' ? 'Resubmit' : 'Turn in'}
              </Button>
              {resolved.mySubmissionStatus === 'SUBMITTED' && (
                <p className="text-xs text-gray-500">You've already turned this in — submitting again replaces your answer.</p>
              )}
            </form>
          )}
        </Card>
      )}

      {isTeacher && (
        <Card title={`Submissions (${submissions.length})`}>
          <div className="space-y-4">
            {submissions.length === 0 && <p className="text-sm text-gray-500">No students have submitted yet.</p>}
            {submissions.map((submission) => {
              const draft = gradeDrafts[submission.id] || { grade: submission.grade ?? '', feedback: submission.feedback ?? '' }
              return (
                <div key={submission.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{submission.studentName}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      submission.status === 'GRADED' ? 'bg-green-100 text-green-700' :
                      submission.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                  {submission.content && <ChatMarkdown content={submission.content} />}
                  {submission.status !== 'ASSIGNED' && (
                    <form
                      className="flex flex-wrap items-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800"
                      onSubmit={(event) => {
                        event.preventDefault()
                        gradeMutation.mutate({
                          submissionId: submission.id,
                          grade: Number(draft.grade),
                          feedback: draft.feedback,
                        })
                      }}
                    >
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Grade (/{resolved.points})</label>
                        <input
                          type="number"
                          className="w-24 px-2 py-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-700 text-sm"
                          value={draft.grade}
                          onChange={(e) => setGradeDrafts({ ...gradeDrafts, [submission.id]: { ...draft, grade: e.target.value } })}
                        />
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-gray-500 mb-1">Feedback</label>
                        <input
                          className="w-full px-2 py-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-700 text-sm"
                          value={draft.feedback}
                          onChange={(e) => setGradeDrafts({ ...gradeDrafts, [submission.id]: { ...draft, feedback: e.target.value } })}
                          placeholder="Optional feedback"
                        />
                      </div>
                      <Button type="submit" disabled={gradeMutation.isPending || draft.grade === ''}>
                        {submission.status === 'GRADED' ? 'Update grade' : 'Grade'}
                      </Button>
                    </form>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
