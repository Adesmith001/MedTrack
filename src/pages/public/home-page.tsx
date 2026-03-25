import { Navigate } from 'react-router-dom'
import { Loader } from '../../components/ui/loader'
import { PageContainer } from '../../components/layout/page-container'
import { useAuth } from '../../hooks/use-auth'
import { getDefaultRouteForRole } from '../../lib/auth/roles'

export function HomePage() {
  const { isAuthenticated, isInitialized, role } = useAuth()

  if (!isInitialized) {
    return (
      <PageContainer>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader label="Preparing MedTrack..." />
        </div>
      </PageContainer>
    )
  }

  return <Navigate replace to={isAuthenticated ? getDefaultRouteForRole(role) : '/login'} />
}
