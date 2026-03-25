import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Notice } from '../../components/ui/notice'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'
import { clearAuthFeedback, loginUser } from '../../features/auth/auth-slice'
import { validateLoginForm } from '../../features/auth/auth-validation'
import { useAppDispatch } from '../../hooks/redux'
import { useAuth } from '../../hooks/use-auth'
import { getDefaultRouteForRole } from '../../lib/auth/roles'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { error, isAuthenticated, isLoading, role } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const fieldErrors = validateLoginForm({ email, password })

  useEffect(() => {
    dispatch(clearAuthFeedback())
  }, [dispatch])

  if (isAuthenticated) {
    const requestedRoute = (location.state as { from?: string } | null)?.from
    return <Navigate replace to={requestedRoute ?? getDefaultRouteForRole(role)} />
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    dispatch(clearAuthFeedback())

    if (Object.keys(fieldErrors).length > 0) {
      return
    }

    await dispatch(loginUser({ email: email.trim(), password }))
  }

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Authentication"
        title="Login"
        description="Sign in with your MedTrack email and password to access the correct workspace."
      />
      <Card className="mx-auto w-full max-w-xl">
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          {error ? (
            <Notice tone="error" title="Unable to sign in">
              {error}
            </Notice>
          ) : null}

          <Input
            id="login-email"
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            error={fieldErrors.email}
          />
          <Input
            id="login-password"
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            error={fieldErrors.password}
          />

          <Button fullWidth type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-5 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:justify-between">
          <Link to="/forgot-password" className="font-medium text-teal-700 underline">
            Forgot your password?
          </Link>
          <Link to="/register" className="font-medium text-teal-700 underline">
            Create an account
          </Link>
        </div>
      </Card>
    </PageContainer>
  )
}
