import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'

export function ForgotPasswordPage() {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Authentication"
        title="Forgot Password"
        description="Placeholder recovery flow for email-based password reset."
      />
      <Card className="mx-auto w-full max-w-xl space-y-4">
        <Input label="Email address" type="email" placeholder="name@example.com" />
        <Button fullWidth>Send reset link</Button>
      </Card>
    </PageContainer>
  )
}
