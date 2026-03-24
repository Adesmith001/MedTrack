import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { PageContainer } from '../components/layout/page-container'

export function NotFoundPage() {
  return (
    <PageContainer>
      <Card className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">404</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-slate-950">Page not found</h1>
        <p className="mt-3 text-sm text-slate-600">
          The route does not exist in the current MedTrack foundation.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>Return home</Button>
          </Link>
        </div>
      </Card>
    </PageContainer>
  )
}
