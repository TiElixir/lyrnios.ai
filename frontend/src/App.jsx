import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './components/Landing'
import Session from './components/Session'
import AuthCallback from './components/AuthCallback'
import Login from './components/Login'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-bg-gradient-start via-bg-gradient-mid to-bg-gradient-end">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-loading animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 rounded-full bg-loading animate-pulse" style={{ animationDelay: '300ms' }} />
          <div className="w-3 h-3 rounded-full bg-loading animate-pulse" style={{ animationDelay: '600ms' }} />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Landing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/session/:id"
        element={
          <ProtectedRoute>
            <Session />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App