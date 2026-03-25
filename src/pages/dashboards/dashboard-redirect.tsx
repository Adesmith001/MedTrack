import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import { getDefaultRouteForRole } from '../../lib/auth/roles'

export function DashboardRedirect() {
  const { role } = useAuth()

  return <Navigate replace to={getDefaultRouteForRole(role)} />
}
