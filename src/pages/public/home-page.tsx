import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { openModal, closeModal } from '../../features/ui/ui-slice'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Loader } from '../../components/ui/loader'
import { Modal } from '../../components/ui/modal'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'

export function HomePage() {
  const dispatch = useAppDispatch()
  const activeModal = useAppSelector((state) => state.ui.activeModal)
  const firebaseReady = useAppSelector((state) => state.appConfig.firebaseReady)

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Phase 1 foundation"
        title="MedTrack setup is ready for feature development"
        description="The app now has router structure, Redux, Firebase setup, responsive shells, and reusable UI primitives for the next phases."
        actions={<Badge variant={firebaseReady ? 'success' : 'warning'}>{firebaseReady ? 'Firebase ready' : 'Firebase env pending'}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="space-y-5">
          <div>
            <p className="text-sm font-medium text-slate-500">Included in this phase</p>
            <h2 className="mt-2 font-display text-4xl font-bold text-slate-950">
              Clean routes, typed state, and a clinical UI base.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Use the navigation to review public auth placeholders and internal workspace placeholders for dashboards, children, schedules, reminders, and admin surfaces.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => dispatch(openModal('foundation-status'))}>View foundation status</Button>
            <Button variant="secondary">Ready for Phase 2</Button>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-500">System check</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-950">Environment overview</h2>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
            <span className="text-sm text-slate-600">Firebase configuration</span>
            <Badge variant={firebaseReady ? 'success' : 'warning'}>
              {firebaseReady ? 'Connected' : 'Pending'}
            </Badge>
          </div>
          <Loader label="Base app is compiled and ready." />
        </Card>
      </div>

      <Modal
        title="Foundation status"
        description="This modal is part of the reusable UI layer for later forms and workflows."
        isOpen={activeModal === 'foundation-status'}
        onClose={() => dispatch(closeModal())}
      >
        <div className="space-y-3 text-sm text-slate-600">
          <p>React Router is configured with public and workspace shells.</p>
          <p>Redux Toolkit is configured with auth, ui, and appConfig slices.</p>
          <p>Firebase reads configuration from environment variables without exposing secrets.</p>
        </div>
      </Modal>
    </PageContainer>
  )
}
