import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { aiApi } from '../api/aiApi'

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState('')
  const mutation = useMutation({ mutationFn: aiApi.analyzeResume })
  const result = mutation.data

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Resume Assistant</h1>
      <Card title="Paste Resume Content">
        <textarea
          className="w-full min-h-40 px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste resume text for analysis"
        />
        <div className="mt-3">
          <Button onClick={() => mutation.mutate({ text: resumeText })} disabled={mutation.isPending || !resumeText.trim()}>
            {mutation.isPending ? 'Analyzing...' : 'Analyze Resume'}
          </Button>
        </div>
      </Card>
      {result && (
        <Card title={`ATS Score: ${result.score}/100`}>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {result.suggestions.map((suggestion, index) => <li key={index}>{suggestion}</li>)}
          </ul>
        </Card>
      )}
    </div>
  )
}
