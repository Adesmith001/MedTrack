import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader } from '../components/ui/loader'
import { PageContainer } from '../components/layout/page-container'
import { useAuth } from '../hooks/use-auth'
import { getDefaultRouteForRole } from '../lib/auth/roles'
import type { UserRole } from '../types/app'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, isInitialized, profile } = useAuth()

  if (!isInitialized) {
    return (
      <PageContainer>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader label="Checking your session..." />
        </div>
      </PageContainer>
    )
  }

  if (!isAuthenticated || !profile) {
    return <Navigate replace to="/login" state={{ from: location.pathname }} />
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate replace to={getDefaultRouteForRole(profile.role)} />
  }

  return <Outlet />
}
