import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Card from '../components/common/Card'
import Loader from '../components/common/Loader'
import { dashboardApi } from '../api/dashboardApi'

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.fetchDashboard })

  if (isLoading) return <Loader text="Loading dashboard" />

  const stats = data?.stats || {
    completedTasks: 12,
    notesCount: 18,
    quizAttempts: 9,
    focusHours: 26,
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Smart Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key} title={key.replace(/([A-Z])/g, ' $1')}>
            <p className="text-3xl font-bold text-indigo-600">{value}</p>
          </Card>
        ))}
      </div>
      <Card title="Weekly Productivity">
        <div className="flex items-end gap-2 h-40">
          {[40, 65, 45, 80, 70, 90, 60].map((height, index) => (
            <div key={index} className="flex-1 bg-indigo-100 dark:bg-indigo-900 rounded">
              <div className="bg-indigo-600 rounded" style={{ height: `${height}%` }} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
