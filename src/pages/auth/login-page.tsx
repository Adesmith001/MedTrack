import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'

export function LoginPage() {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Authentication"
        title="Login"
        description="Placeholder login form shell for Firebase Authentication integration in a later phase."
      />
      <Card className="mx-auto w-full max-w-xl space-y-4">
        <Input label="Email address" type="email" placeholder="name@example.com" />
        <Input label="Password" type="password" placeholder="Enter your password" />
        <Button fullWidth>Sign in</Button>
      </Card>
    </PageContainer>
  )
}
