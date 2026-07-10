import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from './MainLayout'
import ProtectedRoute from '../routes/ProtectedRoute'

const queryClient = new QueryClient()

export default function ProtectedApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    </QueryClientProvider>
  )
}
