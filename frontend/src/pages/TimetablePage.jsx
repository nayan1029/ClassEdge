import React, { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'
import { timetableApi } from '../api/timetableApi'

export default function TimetablePage() {
  const [subjects, setSubjects] = useState('Algorithms, Database Systems, Operating Systems, Placement Prep')
  const [weakSubjects, setWeakSubjects] = useState('Placement Prep')
  const [dailyHours, setDailyHours] = useState(2)
  const query = useQuery({ queryKey: ['timetable'], queryFn: timetableApi.get })
  const mutation = useMutation({ mutationFn: timetableApi.generate })

  const table = mutation.data || query.data || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Smart Timetable Generator</h1>
      <Card title="Plan Inputs">
        <div className="grid lg:grid-cols-4 gap-3">
          <input className="px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700 lg:col-span-2" value={subjects} onChange={(event) => setSubjects(event.target.value)} placeholder="Subjects, separated by commas" />
          <input className="px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700" value={weakSubjects} onChange={(event) => setWeakSubjects(event.target.value)} placeholder="Weak subjects" />
          <input className="px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700" type="number" min="1" max="8" value={dailyHours} onChange={(event) => setDailyHours(event.target.value)} />
        </div>
        <div className="mt-3">
          <Button
            onClick={() => mutation.mutate({ subjects, weakSubjects, dailyHours: Number(dailyHours) })}
            disabled={mutation.isPending || !subjects.trim()}
          >
            {mutation.isPending ? 'Generating...' : 'Generate Timetable'}
          </Button>
        </div>
      </Card>
      <Card title="Generated Timetable">
        {query.isLoading && !mutation.data ? <Loader text="Loading timetable" /> : null}
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="py-2">Day</th>
                <th className="py-2">Subject</th>
                <th className="py-2">Time</th>
                <th className="py-2">Focus</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, index) => (
                <tr key={`${row.day}-${row.subject}-${index}`} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2">{row.day}</td>
                  <td className="py-2">{row.subject}</td>
                  <td className="py-2">{row.time || row.slot}</td>
                  <td className="py-2">{row.focus || 'Revision'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
