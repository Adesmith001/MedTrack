import { startTransition, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardPanel } from '../../components/dashboard/dashboard-panel'
import { StatCard } from '../../components/dashboard/stat-card'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'
import { Button } from '../../components/ui/button'
import { Loader } from '../../components/ui/loader'
import {
  loadParentDashboardData,
  type DashboardResourceState,
  type ParentDashboardData,
} from '../../features/dashboard/dashboard-data'
import { useAuth } from '../../hooks/use-auth'
import { formatDisplayDate } from '../../lib/date'

const initialState: DashboardResourceState<ParentDashboardData> = {
  status: 'loading',
  data: null,
  error: null,
}

export function ParentDashboardPage() {
  const { profile } = useAuth()
  const [resource, setResource] = useState<DashboardResourceState<ParentDashboardData>>(initialState)

  useEffect(() => {
    if (!profile?.email) {
      return
    }

    let isActive = true

    void loadParentDashboardData(profile.email)
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
          error: error instanceof Error ? error.message : 'Failed to load the parent dashboard.',
        })
      })

    return () => {
      isActive = false
    }
  }, [profile?.email])

  const dashboard = resource.data

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Parent Dashboard"
        title={profile ? `Hello, ${profile.fullName.split(' ')[0]}` : 'Parent dashboard'}
        description="Track each linked child, see the next vaccine due, and keep a clear view of reminders and completed doses."
        actions={
          <Link to="/children">
            <Button variant="secondary">Open child profiles</Button>
          </Link>
        }
      />

      {resource.status === 'loading' ? (
        <div className="surface flex min-h-[360px] items-center justify-center rounded-[32px]">
          <Loader label="Loading parent dashboard..." />
        </div>
      ) : resource.error ? (
        <div className="surface rounded-[32px] px-6 py-8">
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{resource.error}</p>
        </div>
      ) : dashboard ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Linked children"
              value={dashboard.children.length}
              hint="Profiles currently associated with your account."
              tone="teal"
            />
            <StatCard
              label="Due soon"
              value={dashboard.dueSoonCount}
              hint="Schedule items that need attention soon."
              tone="amber"
            />
            <StatCard
              label="Upcoming reminders"
              value={dashboard.upcomingReminders.length}
              hint="Reminder entries generated for your linked children."
              tone="sky"
            />
            <StatCard
              label="Completed doses"
              value={`${dashboard.completedCount}/${dashboard.totalScheduleCount || 0}`}
              hint="Completed schedules compared with planned doses."
              tone="default"
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
            <DashboardPanel
              title="Linked children"
              description="Each child row highlights the next planned vaccine and current completion progress."
            >
              {dashboard.childSnapshots.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 px-5 py-12 text-center">
                  <p className="text-lg font-semibold text-slate-950">No linked children yet</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Child profiles connected to your account will appear here once staff register them.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200/80">
                  {dashboard.childSnapshots.map((item) => (
                    <div key={item.child.id} className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1.2fr)_220px_180px_auto] lg:items-center">
                      <div>
                        <p className="font-display text-xl font-bold text-slate-950">{item.child.fullName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Date of birth: {formatDisplayDate(item.child.dateOfBirth)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Next due vaccine
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {item.nextDue ? item.nextDue.vaccineName : 'All scheduled doses completed'}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.nextDue
                            ? `${formatDisplayDate(item.nextDue.dueDate)} • ${item.nextDue.status}`
                            : 'No pending schedule items'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Completion
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {item.completedCount} of {item.totalCount || 0}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.upcomingReminderCount} reminder{item.upcomingReminderCount === 1 ? '' : 's'} in view
                        </p>
                      </div>

                      <div className="flex justify-start lg:justify-end">
                        <Link to={`/children/${item.child.id}`}>
                          <Button variant="secondary">View child</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardPanel>

            <div className="grid gap-5">
              <DashboardPanel
                title="Upcoming reminders"
                description="The nearest reminder items generated for your linked children."
              >
                {dashboard.upcomingReminders.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Upcoming reminder entries will appear here as reminder rules generate queue items.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {dashboard.upcomingReminders.map((item) => (
                      <div key={item.reminder.id} className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-950">{item.child.fullName}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {item.schedule
                                ? `${item.schedule.vaccineName} • due ${formatDisplayDate(item.schedule.dueDate)}`
                                : 'Schedule details unavailable'}
                            </p>
                          </div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                            {item.reminder.channel}
                          </p>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">{item.reminder.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </DashboardPanel>

              <DashboardPanel
                title="Completed vaccine summary"
                description="A quick progress view for each linked child."
              >
                {dashboard.childSnapshots.length === 0 ? (
                  <p className="text-sm text-slate-500">Completion progress appears once a linked child has a schedule.</p>
                ) : (
                  <div className="space-y-4">
                    {dashboard.childSnapshots.map((item) => {
                      const completionRatio =
                        item.totalCount > 0 ? Math.round((item.completedCount / item.totalCount) * 100) : 0

                      return (
                        <div key={`${item.child.id}-progress`} className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">{item.child.fullName}</p>
                            <p className="text-sm text-slate-500">{completionRatio}% complete</p>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-teal-700 transition-[width]"
                              style={{ width: `${completionRatio}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
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
