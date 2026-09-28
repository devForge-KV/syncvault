import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AgencyDashboard from './pages/AgencyDashboard'
import ClientPortal from './pages/ClientPortal'
import ForgotPassword from './pages/ForgotPassword'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/AdminDashboard'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsOfService from './pages/legal/TermsOfService'
import RefundPolicy from './pages/legal/RefundPolicy'
import ContactUs from './pages/legal/ContactUs'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

const getRoleHome = (role) => {
  if (role === 'superadmin') return '/admin'
  return role === 'agency' ? '/dashboard' : '/portal'
}

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('syncvault_user'))
  } catch {
    return null
  }
}

function RequireAuth({ children, role, roles }) {
  const location = useLocation()
  const token = localStorage.getItem('syncvault_token')
  const user = getStoredUser()

  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (role && user?.role !== role) return <Navigate to={getRoleHome(user?.role)} replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to={getRoleHome(user?.role)} replace />

  return children
}

function PublicOnly({ children }) {
  const token = localStorage.getItem('syncvault_token')
  const user = getStoredUser()
  if (!token) return children
  return <Navigate to={getRoleHome(user?.role)} replace />
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
        <Route path="/forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
        <Route path="/reset-password/:token" element={<PublicOnly><ResetPassword /></PublicOnly>} />
        <Route path="/dashboard" element={localStorage.getItem('syncvault_token') && ['agency', 'superadmin'].includes(getStoredUser()?.role) ? <AgencyDashboard /> : <Navigate to={getStoredUser()?.role === 'client' ? '/portal' : '/login'} replace />} />
        <Route path="/portal" element={<RequireAuth role="client"><ClientPortal /></RequireAuth>} />
        <Route path="/agency-dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/client-portal" element={<Navigate to="/portal" replace />} />
        <Route path="/admin" element={getStoredUser()?.role === 'superadmin' && localStorage.getItem('syncvault_token') ? <AdminDashboard /> : <Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
