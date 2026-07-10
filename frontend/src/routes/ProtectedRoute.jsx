import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { sessionService } from '../services/session'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const isAuthenticated = sessionService.isAuthenticated()
  return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location }} />
}

