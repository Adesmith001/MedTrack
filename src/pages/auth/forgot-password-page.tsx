import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'
import { clearAuthFeedback, sendPasswordReset } from '../../features/auth/auth-slice'
import { validateForgotPasswordForm } from '../../features/auth/auth-validation'
import { useAppDispatch } from '../../hooks/redux'
import { useAuth } from '../../hooks/use-auth'

export function ForgotPasswordPage() {
  const dispatch = useAppDispatch()
  const { error, isLoading, successMessage } = useAuth()
  const [email, setEmail] = useState('')
  const fieldErrors = validateForgotPasswordForm({ email })

  useEffect(() => {
    dispatch(clearAuthFeedback())
  }, [dispatch])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    dispatch(clearAuthFeedback())

    if (Object.keys(fieldErrors).length > 0) {
      return
    }

    await dispatch(sendPasswordReset({ email: email.trim() }))
  }

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Authentication"
        title="Forgot Password"
        description="Enter your email address to receive a password reset link."
      />
      <Card className="mx-auto w-full max-w-xl">
        {error ? (
          <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            {error}
          </div>
        ) : null}
        {successMessage ? (
          <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <Input
            id="forgot-password-email"
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            error={fieldErrors.email}
          />
          <Button fullWidth type="submit" disabled={isLoading}>
            {isLoading ? 'Sending reset link...' : 'Send reset link'}
          </Button>
        </form>

        <div className="mt-5 text-sm text-slate-600">
          <Link to="/login" className="font-medium text-teal-700 underline">
            Return to login
          </Link>
        </div>
      </Card>
    </PageContainer>
  )
}
