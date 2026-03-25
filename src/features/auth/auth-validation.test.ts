import {
  validateForgotPasswordForm,
  validateLoginForm,
  validateRegisterForm,
  validateResetPasswordForm,
} from './auth-validation'

describe('auth-validation', () => {
  it('validates login form values', () => {
    expect(validateLoginForm({ email: '', password: '' })).toEqual({
      email: 'Email is required.',
      password: 'Password is required.',
    })

    expect(validateLoginForm({ email: 'invalid-email', password: 'secret' })).toEqual({
      email: 'Enter a valid email address.',
    })
  })

  it('validates register form values', () => {
    expect(
      validateRegisterForm({
        fullName: '',
        email: 'not-valid',
        password: '123',
        confirmPassword: '456',
        role: '',
      }),
    ).toEqual({
      fullName: 'Full name is required.',
      email: 'Enter a valid email address.',
      password: 'Password must be at least 6 characters.',
      confirmPassword: 'Passwords do not match.',
      role: 'Select a role.',
    })
  })

  it('validates forgot-password and reset-password forms', () => {
    expect(validateForgotPasswordForm({ email: '' })).toEqual({
      email: 'Email is required.',
    })

    expect(validateResetPasswordForm({ password: '123', confirmPassword: '456' })).toEqual({
      password: 'Password must be at least 6 characters.',
      confirmPassword: 'Passwords do not match.',
    })
  })
})
