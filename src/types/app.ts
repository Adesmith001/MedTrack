export type UserRole = 'parent' | 'staff' | 'admin'

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

export type AppModal = 'foundation-status' | null

export interface AuthSessionUser {
  uid: string
  email: string | null
}
