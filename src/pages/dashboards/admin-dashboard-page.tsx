import { startTransition, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardPanel } from '../../components/dashboard/dashboard-panel'
import { StatCard } from '../../components/dashboard/stat-card'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'
import { Button } from '../../components/ui/button'
import { Loader } from '../../components/ui/loader'
import {
  loadAdminDashboardData,
  type AdminDashboardData,
  type DashboardResourceState,
} from '../../features/dashboard/dashboard-data'

const initialState: DashboardResourceState<AdminDashboardData> = {
  status: 'loading',
  data: null,
  error: null,
}

export function AdminDashboardPage() {
  const [resource, setResource] = useState<DashboardResourceState<AdminDashboardData>>(initialState)

  useEffect(() => {
    let isActive = true

    void loadAdminDashboardData()
      .then((data) => {
        if (!isActive) {
          return
        }

        startTransition(() => {
          setResource({
            status: 'succeeded',
            data,
            error: null,
          })
        })
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return
        }

        setResource({
          status: 'failed',
          data: null,
          error: error instanceof Error ? error.message : 'Failed to load the admin dashboard.',
        })
      })

    return () => {
      isActive = false
    }
  }, [])

  const dashboard = resource.data

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Admin Dashboard"
        title="System overview"
        description="Monitor account growth, vaccine workload, reminder delivery pressure, and recent activity across the MedTrack workspace."
        actions={
          <Link to="/admin">
            <Button variant="secondary">Open admin tools</Button>
          </Link>
        }
      />

      {resource.status === 'loading' ? (
        <div className="surface flex min-h-90 items-center justify-center rounded-4xl">
          <Loader label="Loading admin dashboard..." />
        </div>
      ) : resource.error ? (
        <div className="surface rounded-4xl px-6 py-8">
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{resource.error}</p>
        </div>
      ) : dashboard ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Total users"
              value={dashboard.totalUsers}
              hint="All role profiles stored in Firestore."
              tone="teal"
            />
            <StatCard
              label="Total children"
              value={dashboard.totalChildren}
              hint="Child profiles currently registered in MedTrack."
              tone="default"
            />
            <StatCard
              label="Due vaccines"
              value={dashboard.totalDueVaccines}
              hint="Schedule items currently in the due window."
              tone="sky"
            />
            <StatCard
              label="Overdue vaccines"
              value={dashboard.totalOverdueVaccines}
              hint="Vaccinations that are already past their due date."
              tone="rose"
            />
            <StatCard
              label="Pending reminders"
              value={dashboard.reminderStats.pending}
              hint="Reminder entries waiting in the queue."
              tone="amber"
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)]">
            <DashboardPanel
              title="Recent system activity"
              description="A merged operational feed spanning account creation, child registration, reminder activity, and vaccine completion updates."
            >
              {dashboard.recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500">Recent system activity will appear here once records begin to flow through the platform.</p>
              ) : (
                <div className="divide-y divide-slate-200/80">
                  {dashboard.recentActivity.map((activity) => (
                    <div key={activity.id} className="grid gap-3 py-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
                      <div>
                        <p className="font-semibold text-slate-950">{activity.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{activity.detail}</p>
                      </div>
                      <p className="text-sm text-slate-500 lg:text-right">{activity.timestampLabel}</p>
                    </div>
                  ))}
                </div>
              )}
            </DashboardPanel>

            <div className="grid gap-5">
              <DashboardPanel
                title="Reminder statistics"
                description="Track queue pressure and delivery health at a glance."
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50/75 px-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-950">Pending reminders</p>
                      <p className="mt-1 text-sm text-slate-500">Queued for later delivery.</p>
                    </div>
                    <p className="font-display text-2xl font-bold text-slate-950">{dashboard.reminderStats.pending}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50/75 px-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-950">Sent reminders</p>
                      <p className="mt-1 text-sm text-slate-500">Successfully delivered reminders.</p>
                    </div>
                    <p className="font-display text-2xl font-bold text-emerald-700">{dashboard.reminderStats.sent}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50/75 px-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-950">Failed reminders</p>
                      <p className="mt-1 text-sm text-slate-500">Delivery attempts needing review.</p>
                    </div>
                    <p className="font-display text-2xl font-bold text-rose-700">{dashboard.reminderStats.failed}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50/75 px-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-950">Cancelled reminders</p>
                      <p className="mt-1 text-sm text-slate-500">Queue entries intentionally stopped.</p>
                    </div>
                    <p className="font-display text-2xl font-bold text-slate-900">{dashboard.reminderStats.cancelled}</p>
                  </div>
                </div>
              </DashboardPanel>

              <DashboardPanel
                title="Operational focus"
                description="Use the current counts to decide where supervision and follow-up are needed."
              >
                <div className="space-y-4 text-sm text-slate-600">
                  <div className="rounded-[22px] border border-slate-200 bg-white/80 px-4 py-4">
                    <p className="font-semibold text-slate-950">Due workload</p>
                    <p className="mt-1">
                      {dashboard.totalDueVaccines} schedule item{dashboard.totalDueVaccines === 1 ? '' : 's'} are currently due across the clinic workflow.
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-slate-200 bg-white/80 px-4 py-4">
                    <p className="font-semibold text-slate-950">Overdue pressure</p>
                    <p className="mt-1">
                      {dashboard.totalOverdueVaccines} schedule item{dashboard.totalOverdueVaccines === 1 ? '' : 's'} are overdue and likely need targeted follow-up.
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-slate-200 bg-white/80 px-4 py-4">
                    <p className="font-semibold text-slate-950">Reminder queue health</p>
                    <p className="mt-1">
                      Pending and failed reminder counts should stay in view before queue backlogs begin to affect parent communication.
                    </p>
                  </div>
                </div>
              </DashboardPanel>
            </div>
          </div>
        </>
      ) : null}
    </PageContainer>
  )
}
