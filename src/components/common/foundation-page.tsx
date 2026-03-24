import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { PageContainer } from '../layout/page-container'
import { SectionHeader } from '../layout/section-header'
import { TableShell } from '../ui/table-shell'

interface FoundationPageProps {
  eyebrow: string
  title: string
  description: string
  status: string
}

export function FoundationPage({
  description,
  eyebrow,
  status,
  title,
}: FoundationPageProps) {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={<Badge variant="info">{status}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card>
          <h2 className="font-display text-2xl font-bold text-slate-950">Phase 1 placeholder</h2>
          <p className="mt-2 text-sm text-slate-600">
            This route is scaffolded and ready for business logic, forms, and Firebase-backed data in later phases.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Layout
              </p>
              <p className="mt-2 text-sm text-slate-700">Responsive shell and spacing tokens are in place.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                State
              </p>
              <p className="mt-2 text-sm text-slate-700">Redux slices are connected and ready for expansion.</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-2xl font-bold text-slate-950">Next implementation surface</h2>
          <TableShell
            columns={[
              { key: 'area', label: 'Area' },
              { key: 'next', label: 'Next phase' },
            ]}
            rows={[
              { id: 'ui', cells: ['UI', 'Connect forms and field validation'] },
              { id: 'data', cells: ['Data', 'Attach Firestore collections and services'] },
              { id: 'access', cells: ['Access', 'Add auth flows and route guards'] },
            ]}
            emptyMessage="No items yet."
          />
        </Card>
      </div>
    </PageContainer>
  )
}
