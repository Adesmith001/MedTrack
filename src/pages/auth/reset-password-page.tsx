import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Notice } from '../../components/ui/notice'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'
import { clearAuthFeedback, confirmPasswordReset } from '../../features/auth/auth-slice'
import { getAuthErrorMessage } from '../../features/auth/auth-errors'
import { validateResetPasswordForm } from '../../features/auth/auth-validation'
import { useAppDispatch } from '../../hooks/redux'
import { useAuth } from '../../hooks/use-auth'
import { validatePasswordResetCode } from '../../services/auth-service'

export function ResetPasswordPage() {
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const { error, isAuthenticated, isLoading, successMessage } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [isCodeValidating, setIsCodeValidating] = useState(true)
  const code = useMemo(() => searchParams.get('oobCode') ?? '', [searchParams])

  useEffect(() => {
    dispatch(clearAuthFeedback())
  }, [dispatch])

  useEffect(() => {
    let isMounted = true

    async function verifyCode() {
      if (!code) {
        setLocalError('Password reset link is missing a reset code.')
        setIsCodeValidating(false)
        return
      }

      setIsCodeValidating(true)

      try {
        const verifiedEmail = await validatePasswordResetCode(code)

        if (isMounted) {
          setEmail(verifiedEmail)
          setLocalError(null)
        }
      } catch (verificationError) {
        if (isMounted) {
          setLocalError(getAuthErrorMessage(verificationError))
        }
      } finally {
        if (isMounted) {
          setIsCodeValidating(false)
        }
      }
    }

    void verifyCode()

    return () => {
      isMounted = false
    }
  }, [code])

  if (isAuthenticated) {
    return <Navigate replace to="/" />
  }

  const fieldErrors = validateResetPasswordForm({ password, confirmPassword })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    dispatch(clearAuthFeedback())

    if (Object.keys(fieldErrors).length > 0) {
      return
    }

    if (!code) {
      setLocalError('Password reset link is missing a reset code.')
      return
    }

    await dispatch(confirmPasswordReset({ code, password }))
  }

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Authentication"
        title="Reset Password"
        description="Enter a new password to finish the recovery process."
      />
      <Card className="mx-auto w-full max-w-xl space-y-4">
        {isCodeValidating ? (
          <p className="text-sm text-slate-500">Validating your password reset link...</p>
        ) : null}
        {email ? <p className="text-sm text-slate-600">Resetting password for {email}</p> : null}
        {localError ? (
          <Notice tone="error" title="Reset link unavailable">
            {localError}
          </Notice>
        ) : null}
        {error ? (
          <Notice tone="error" title="Unable to update password">
            {error}
          </Notice>
        ) : null}
        {successMessage ? (
          <Notice tone="success" title="Password updated">
            <p>{successMessage}</p>
            <Link to="/login" className="mt-2 inline-flex font-semibold underline">
              Return to login
            </Link>
          </Notice>
        ) : null}

        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <Input
            id="reset-password"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
          />
          <Input
            id="reset-confirm-password"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={fieldErrors.confirmPassword}
          />
          <Button fullWidth type="submit" disabled={isLoading || isCodeValidating || Boolean(localError)}>
            {isLoading ? 'Updating password...' : 'Update password'}
          </Button>
        </form>
      </Card>
    </PageContainer>
  )
}
