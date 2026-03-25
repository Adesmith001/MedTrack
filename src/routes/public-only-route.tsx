import { Navigate, Outlet } from 'react-router-dom'
import { Loader } from '../components/ui/loader'
import { PageContainer } from '../components/layout/page-container'
import { useAuth } from '../hooks/use-auth'
import { getPublicOnlyRouteDecision } from './route-guards'

export function PublicOnlyRoute() {
  const { isAuthenticated, isInitialized, role } = useAuth()
  const decision = getPublicOnlyRouteDecision({
    isInitialized,
    isAuthenticated,
    role,
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
    return <Navigate replace to={decision.to} />
  }

  return <Outlet />
}
