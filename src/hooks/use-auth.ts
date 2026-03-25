import { useMemo } from 'react'
import { useAppSelector } from './redux'
import {
  selectAuthError,
  selectAuthProfile,
  selectAuthRole,
  selectAuthStatus,
  selectAuthSuccessMessage,
  selectAuthUser,
  selectIsAuthInitialized,
  selectIsAuthenticated,
  selectIsAuthLoading,
} from '../features/auth/auth-selectors'

export function useAuth() {
  const status = useAppSelector(selectAuthStatus)
  const user = useAppSelector(selectAuthUser)
  const profile = useAppSelector(selectAuthProfile)
  const role = useAppSelector(selectAuthRole)
  const error = useAppSelector(selectAuthError)
  const successMessage = useAppSelector(selectAuthSuccessMessage)
  const isInitialized = useAppSelector(selectIsAuthInitialized)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isLoading = useAppSelector(selectIsAuthLoading)

  return useMemo(
    () => ({
      status,
      user,
      profile,
      role,
      error,
      successMessage,
      isInitialized,
      isAuthenticated,
      isLoading,
    }),
    [error, isAuthenticated, isInitialized, isLoading, profile, role, status, successMessage, user],
  )
}
