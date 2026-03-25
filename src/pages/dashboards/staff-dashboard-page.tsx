import { startTransition, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardPanel } from '../../components/dashboard/dashboard-panel'
import { StatCard } from '../../components/dashboard/stat-card'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'
import { Button } from '../../components/ui/button'
import { Loader } from '../../components/ui/loader'
import {
  loadStaffDashboardData,
  type DashboardResourceState,
  type StaffDashboardData,
} from '../../features/dashboard/dashboard-data'
import { formatDisplayDate } from '../../lib/date'

const initialState: DashboardResourceState<StaffDashboardData> = {
  status: 'loading',
  data: null,
  error: null,
}

export function StaffDashboardPage() {
  const [resource, setResource] = useState<DashboardResourceState<StaffDashboardData>>(initialState)

  useEffect(() => {
    let isActive = true

    void loadStaffDashboardData()
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
          error: error instanceof Error ? error.message : 'Failed to load the staff dashboard.',
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
        eyebrow="Staff Dashboard"
        title="Clinical operations"
        description="Focus on today’s due vaccines, near-term workload, overdue follow-up, and the latest immunization updates."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/children/new">
              <Button>Add child</Button>
            </Link>
            <Link to="/immunization-schedule">
              <Button variant="secondary">Mark vaccine as completed</Button>
            </Link>
          </div>
        }
      />

      {resource.status === 'loading' ? (
        <div className="surface flex min-h-[360px] items-center justify-center rounded-[32px]">
          <Loader label="Loading staff dashboard..." />
        </div>
      ) : resource.error ? (
        <div className="surface rounded-[32px] px-6 py-8">
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{resource.error}</p>
        </div>
      ) : dashboard ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Children due today"
              value={dashboard.dueToday.length}
              hint="Schedule entries that should be handled today."
              tone="teal"
            />
            <StatCard
              label="Upcoming vaccinations"
              value={dashboard.upcoming.length}
              hint="Items arriving within the next seven days."
              tone="sky"
            />
            <StatCard
              label="Overdue vaccinations"
              value={dashboard.overdue.length}
              hint="Follow-up workload requiring immediate attention."
              tone="rose"
            />
            <StatCard
              label="Recent record updates"
              value={dashboard.recentRecords.length}
              hint="Latest immunization records captured by staff."
              tone="default"
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.92fr)]">
            <div className="grid gap-5">
              <DashboardPanel
                title="Due today"
                description="Children and vaccine entries that should be completed in the current clinic session."
              >
                {dashboard.dueToday.length === 0 ? (
                  <p className="text-sm text-slate-500">No vaccines are due today.</p>
                ) : (
                  <div className="divide-y divide-slate-200/80">
                    {dashboard.dueToday.map((item) => (
                      <div key={item.schedule.id} className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_200px_auto] lg:items-center">
                        <div>
                          <p className="font-semibold text-slate-950">{item.child?.fullName ?? 'Unknown child'}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.schedule.vaccineName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{formatDisplayDate(item.schedule.dueDate)}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.schedule.recommendedAge}</p>
                        </div>
                        <div className="flex justify-start lg:justify-end">
                          <Link to={`/immunization-schedule?childId=${item.schedule.childId}`}>
                            <Button variant="secondary">Open schedule</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DashboardPanel>

              <DashboardPanel
                title="Overdue vaccinations"
                description="The oldest overdue entries bubble to the top so staff can triage follow-up quickly."
              >
                {dashboard.overdue.length === 0 ? (
                  <p className="text-sm text-slate-500">No overdue vaccine entries right now.</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.overdue.map((item) => (
                      <div key={item.schedule.id} className="rounded-[22px] border border-rose-100 bg-rose-50/70 px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-950">{item.child?.fullName ?? 'Unknown child'}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {item.schedule.vaccineName} • due {formatDisplayDate(item.schedule.dueDate)}
                            </p>
                          </div>
                          <Link to={`/immunization-schedule?childId=${item.schedule.childId}`}>
                            <Button variant="secondary">Review</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DashboardPanel>
            </div>

            <div className="grid gap-5">
              <DashboardPanel
                title="Upcoming vaccinations"
                description="Use this to prepare upcoming clinics and communicate early with parents."
              >
                {dashboard.upcoming.length === 0 ? (
                  <p className="text-sm text-slate-500">No upcoming vaccinations in the next seven days.</p>
                ) : (
                  <div className="space-y-4">
                    {dashboard.upcoming.map((item) => (
                      <div key={item.schedule.id} className="flex items-start justify-between gap-4 rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                        <div>
                          <p className="font-semibold text-slate-950">{item.child?.fullName ?? 'Unknown child'}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.schedule.vaccineName}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatDisplayDate(item.schedule.dueDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </DashboardPanel>

              <DashboardPanel
                title="Recently updated immunization records"
                description="A concise audit trail of the latest vaccine completion work."
              >
                {dashboard.recentRecords.length === 0 ? (
                  <p className="text-sm text-slate-500">Completed records will appear here once vaccines are marked as done.</p>
                ) : (
                  <div className="space-y-4">
                    {dashboard.recentRecords.map((item) => (
                      <div key={item.record.id} className="rounded-[22px] border border-slate-200 bg-white/70 px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-950">{item.record.vaccineName}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {item.child?.fullName ?? 'Unknown child'} • administered {formatDisplayDate(item.record.dateAdministered)}
                            </p>
                          </div>
                          <Link to={`/children/${item.record.childId}`}>
                            <Button variant="ghost">Open child</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DashboardPanel>
            </div>
          </div>
        </>
      ) : null}
    </PageContainer>
  )
}
