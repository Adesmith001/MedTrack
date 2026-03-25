export type AuthFormErrors<TField extends string> = Partial<Record<TField, string>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLoginForm(values: {
  email: string
  password: string
}): AuthFormErrors<'email' | 'password'> {
  const errors: AuthFormErrors<'email' | 'password'> = {}

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  }

  return errors
}

export function validateRegisterForm(values: {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  role: string
}): AuthFormErrors<'fullName' | 'email' | 'password' | 'confirmPassword' | 'role'> {
  const errors: AuthFormErrors<
    'fullName' | 'email' | 'password' | 'confirmPassword' | 'role'
  > = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.role) {
    errors.role = 'Select a role.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export function validateForgotPasswordForm(values: {
  email: string
}): AuthFormErrors<'email'> {
  const errors: AuthFormErrors<'email'> = {}

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  return errors
}

export function validateResetPasswordForm(values: {
  password: string
  confirmPassword: string
}): AuthFormErrors<'password' | 'confirmPassword'> {
  const errors: AuthFormErrors<'password' | 'confirmPassword'> = {}

  if (!values.password) {
    errors.password = 'New password is required.'
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your new password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}
