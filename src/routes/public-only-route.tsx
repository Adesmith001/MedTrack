import { Navigate, Outlet } from 'react-router-dom'
import { Loader } from '../components/ui/loader'
import { PageContainer } from '../components/layout/page-container'
import { useAuth } from '../hooks/use-auth'
import { getDefaultRouteForRole } from '../lib/auth/roles'

export function PublicOnlyRoute() {
  const { isAuthenticated, isInitialized, role } = useAuth()

  if (!isInitialized) {
    return (
      <PageContainer>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader label="Checking your session..." />
        </div>
      </PageContainer>
    )
  }

  if (isAuthenticated) {
    return <Navigate replace to={getDefaultRouteForRole(role)} />
  }

  return <Outlet />
}
