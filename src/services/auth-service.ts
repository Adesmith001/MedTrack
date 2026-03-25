import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  verifyPasswordResetCode,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import type { UserRole } from '../types/app'
import type { UserProfile } from '../types/models'
import { usersService } from './users-service'

function ensureAuth() {
  if (!auth) {
    throw new Error(
      'Firebase Authentication is not initialized. Set the required VITE_FIREBASE_* variables first.',
    )
  }

  return auth
}

export interface RegisterUserInput {
  fullName: string
  email: string
  password: string
  role: UserRole
}

export interface LoginUserInput {
  email: string
  password: string
}

export async function registerUser(input: RegisterUserInput): Promise<UserProfile> {
  const authInstance = ensureAuth()
  const credential = await createUserWithEmailAndPassword(
    authInstance,
    input.email,
    input.password,
  )

  await updateProfile(credential.user, { displayName: input.fullName })

  const profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
    uid: credential.user.uid,
    fullName: input.fullName,
    email: input.email,
    role: input.role,
  }

  await usersService.createProfile(credential.user.uid, profileData)
  const profile = await usersService.getByUid(credential.user.uid)

  if (!profile) {
    throw new Error('User profile could not be created.')
  }

  return profile
}

export async function loginUser(input: LoginUserInput): Promise<void> {
  const authInstance = ensureAuth()
  await signInWithEmailAndPassword(authInstance, input.email, input.password)
}

export async function logoutUser(): Promise<void> {
  const authInstance = ensureAuth()
  await signOut(authInstance)
}

export async function requestPasswordReset(email: string): Promise<void> {
  const authInstance = ensureAuth()
  await sendPasswordResetEmail(authInstance, email)
}

export async function validatePasswordResetCode(code: string): Promise<string> {
  const authInstance = ensureAuth()
  return verifyPasswordResetCode(authInstance, code)
}

export async function resetPassword(code: string, newPassword: string): Promise<void> {
  const authInstance = ensureAuth()
  await confirmPasswordReset(authInstance, code, newPassword)
}
