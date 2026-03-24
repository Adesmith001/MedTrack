import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'

export function RegisterPage() {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Authentication"
        title="Register"
        description="Placeholder registration form for parent, staff, and admin account onboarding."
      />
      <Card className="mx-auto w-full max-w-xl space-y-4">
        <Input label="Full name" placeholder="Enter your full name" />
        <Input label="Email address" type="email" placeholder="name@example.com" />
        <Input label="Password" type="password" placeholder="Create a password" />
        <Button fullWidth>Create account</Button>
      </Card>
    </PageContainer>
  )
}
