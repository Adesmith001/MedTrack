const firebaseAuthErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'An account already exists with this email address.',
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/missing-password': 'Enter your password to continue.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account was found with this email address.',
  'auth/weak-password': 'Password must be at least 6 characters long.',
  'auth/expired-action-code': 'This password reset link has expired.',
  'auth/invalid-action-code': 'This password reset link is invalid.',
}

export function getAuthErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error && 'code' in error) {
    const code = String(error.code)
    return firebaseAuthErrorMessages[code] ?? 'Something went wrong. Please try again.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
