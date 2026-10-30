import React, { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Loader from '../components/common/Loader'
import ProtectedApp from '../layouts/ProtectedApp'

const LandingPage = lazy(() => import('../pages/LandingPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage'))
const OAuthCallbackPage = lazy(() => import('../pages/OAuthCallbackPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const ClassroomsPage = lazy(() => import('../pages/ClassroomsPage'))
const ClassroomDetailPage = lazy(() => import('../pages/ClassroomDetailPage'))
const AssignmentDetailPage = lazy(() => import('../pages/AssignmentDetailPage'))
const NotesPage = lazy(() => import('../pages/NotesPage'))
const SummarizerPage = lazy(() => import('../pages/SummarizerPage'))
const AssistantPage = lazy(() => import('../pages/AssistantPage'))
const QuizPage = lazy(() => import('../pages/QuizPage'))
const TasksPage = lazy(() => import('../pages/TasksPage'))
const TimetablePage = lazy(() => import('../pages/TimetablePage'))
const LibraryPage = lazy(() => import('../pages/LibraryPage'))
const CommunicationPage = lazy(() => import('../pages/CommunicationPage'))
const AttendancePage = lazy(() => import('../pages/AttendancePage'))
const LeavePage = lazy(() => import('../pages/LeavePage'))
const FeesPage = lazy(() => import('../pages/FeesPage'))
const StudentsPage = lazy(() => import('../pages/StudentsPage'))
const LessonPlansPage = lazy(() => import('../pages/LessonPlansPage'))

const ProfilePage = lazy(() => import('../pages/ProfilePage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Loader text="Loading section..." />
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

        <Route element={<ProtectedApp />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/classes" element={<ClassroomsPage />} />
          <Route path="/classes/:classroomId" element={<ClassroomDetailPage />} />
          <Route path="/assignments/:assignmentId" element={<AssignmentDetailPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/summarizer" element={<SummarizerPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/communication" element={<CommunicationPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/leave" element={<LeavePage />} />
          <Route path="/fees" element={<FeesPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/lesson-plans" element={<LessonPlansPage />} />

          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/app" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
