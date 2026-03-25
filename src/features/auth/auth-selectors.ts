import type { RootState } from '../../app/store'

export const selectAuthState = (state: RootState) => state.auth
export const selectAuthStatus = (state: RootState) => state.auth.status
export const selectAuthUser = (state: RootState) => state.auth.user
export const selectAuthProfile = (state: RootState) => state.auth.profile
export const selectAuthRole = (state: RootState) => state.auth.profile?.role ?? null
export const selectAuthError = (state: RootState) => state.auth.error
export const selectAuthSuccessMessage = (state: RootState) => state.auth.successMessage
export const selectIsAuthInitialized = (state: RootState) => state.auth.isInitialized
export const selectIsAuthenticated = (state: RootState) => state.auth.status === 'authenticated'
export const selectIsAuthLoading = (state: RootState) => state.auth.status === 'loading'
