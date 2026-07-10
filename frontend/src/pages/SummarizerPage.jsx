import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { aiApi } from '../api/aiApi'

export default function SummarizerPage() {
  const [text, setText] = useState('')

  const mutation = useMutation({ mutationFn: aiApi.summarize })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">AI Notes Summarizer</h1>
      <Card title="Paste Notes">
        <textarea
          className="w-full min-h-36 px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste long notes to summarize"
        />
        <div className="mt-3">
          <Button onClick={() => mutation.mutate({ text })} disabled={mutation.isPending || !text.trim()}>
            {mutation.isPending ? 'Summarizing...' : 'Generate Summary'}
          </Button>
        </div>
      </Card>
      {mutation.data && (
        <Card title="Summary">
          <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{mutation.data.summary}</p>
          {mutation.data.keyPoints?.length > 0 && (
            <ul className="mt-4 list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">
              {mutation.data.keyPoints.map((point) => <li key={point}>{point}</li>)}
            </ul>
          )}
        </Card>
      )}
    </div>
  )
}
