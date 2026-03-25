import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader } from '../components/ui/loader'
import { PageContainer } from '../components/layout/page-container'
import { useAuth } from '../hooks/use-auth'
import { getProtectedRouteDecision } from './route-guards'
import type { UserRole } from '../types/app'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, isInitialized, profile } = useAuth()
  const decision = getProtectedRouteDecision({
    isInitialized,
    isAuthenticated,
    profile,
    allowedRoles,
    pathname: location.pathname,
  })

  if (decision.type === 'loading') {
    return (
      <PageContainer>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader label="Checking your session..." />
        </div>
      </PageContainer>
    )
  }

  if (decision.type === 'redirect') {
    return <Navigate replace to={decision.to} state={decision.state} />
  }

  return <Outlet />
}
