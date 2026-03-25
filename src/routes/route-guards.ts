import { getDefaultRouteForRole } from '../lib/auth/roles'
import type { UserRole } from '../types/app'
import type { UserProfile } from '../types/models'

type GuardLoadingDecision = {
  type: 'loading'
}

type GuardAllowDecision = {
  type: 'allow'
}

type GuardRedirectDecision = {
  type: 'redirect'
  to: string
  state?: Record<string, unknown>
}

export type GuardDecision = GuardLoadingDecision | GuardAllowDecision | GuardRedirectDecision

interface ProtectedRouteDecisionInput {
  isInitialized: boolean
  isAuthenticated: boolean
  pathname: string
  profile: UserProfile | null
  allowedRoles?: UserRole[]
}

interface PublicOnlyRouteDecisionInput {
  isInitialized: boolean
  isAuthenticated: boolean
  role: UserRole | null | undefined
}

export function getProtectedRouteDecision({
  allowedRoles,
  isAuthenticated,
  isInitialized,
  pathname,
  profile,
}: ProtectedRouteDecisionInput): GuardDecision {
  if (!isInitialized) {
    return { type: 'loading' }
  }

  if (!isAuthenticated || !profile) {
    return {
      type: 'redirect',
      to: '/login',
      state: { from: pathname },
    }
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return {
      type: 'redirect',
      to: getDefaultRouteForRole(profile.role),
    }
  }

  return { type: 'allow' }
}

export function getPublicOnlyRouteDecision({
  isAuthenticated,
  isInitialized,
  role,
}: PublicOnlyRouteDecisionInput): GuardDecision {
  if (!isInitialized) {
    return { type: 'loading' }
  }

  if (isAuthenticated) {
    return {
      type: 'redirect',
      to: getDefaultRouteForRole(role),
    }
  }

  return { type: 'allow' }
}
