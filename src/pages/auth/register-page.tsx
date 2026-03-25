import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'
import { clearAuthFeedback, registerUser } from '../../features/auth/auth-slice'
import { validateRegisterForm } from '../../features/auth/auth-validation'
import { useAppDispatch } from '../../hooks/redux'
import { useAuth } from '../../hooks/use-auth'
import { getDefaultRouteForRole } from '../../lib/auth/roles'
import type { UserRole } from '../../types/app'

export function RegisterPage() {
  const dispatch = useAppDispatch()
  const { error, isAuthenticated, isLoading, role } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('')

  const fieldErrors = validateRegisterForm({
    fullName,
    email,
    password,
    confirmPassword,
    role: selectedRole,
  })

  useEffect(() => {
    dispatch(clearAuthFeedback())
  }, [dispatch])

  if (isAuthenticated) {
    return <Navigate replace to={getDefaultRouteForRole(role)} />
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    dispatch(clearAuthFeedback())

    if (Object.keys(fieldErrors).length > 0 || !selectedRole) {
      return
    }

    await dispatch(
      registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
      }),
    )
  }

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Authentication"
        title="Register"
        description="Create a MedTrack account and assign the correct role during onboarding."
      />
      <Card className="mx-auto w-full max-w-xl">
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          {error ? (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
              {error}
            </div>
          ) : null}

          <Input
            id="register-full-name"
            name="fullName"
            label="Full name"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter your full name"
            error={fieldErrors.fullName}
          />
          <Input
            id="register-email"
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            error={fieldErrors.email}
          />

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Role</span>
            <select
              id="register-role"
              name="role"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value as UserRole | '')}
              aria-invalid={Boolean(fieldErrors.role)}
              aria-describedby={fieldErrors.role ? 'register-role-error' : undefined}
              className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 ${
                fieldErrors.role ? 'border-rose-400' : 'border-slate-200'
              }`}
            >
              <option value="">Select role</option>
              <option value="parent">Parent</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            {fieldErrors.role ? (
              <span id="register-role-error" className="block text-xs text-rose-600">
                {fieldErrors.role}
              </span>
            ) : null}
          </label>

          <Input
            id="register-password"
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            error={fieldErrors.password}
          />
          <Input
            id="register-confirm-password"
            name="confirmPassword"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm your password"
            error={fieldErrors.confirmPassword}
          />

          <Button fullWidth type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-teal-700 underline">
            Sign in
          </Link>
        </p>
      </Card>
    </PageContainer>
  )
}
