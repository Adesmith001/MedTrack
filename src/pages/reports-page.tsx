import { PageHeader } from '../components/layout/page-header'
import { MetricTile } from '../components/ui/metric-tile'
import { buildDeliverySummary, buildFacilityReports } from '../features/admin/reporting'
import { buildChildSchedule } from '../features/immunizations/schedule'
import { useAppSelector } from '../hooks/redux'

export function ReportsPage() {
  const activeRole = useAppSelector((state) => state.auth.activeRole)
  const currentUser = useAppSelector((state) => state.auth.profiles[state.auth.activeRole])
  const children = useAppSelector((state) => state.children.items)
  const reminders = useAppSelector((state) => state.reminders.items)

  const visibleChildren =
    activeRole === 'parent'
      ? children.filter((child) => child.parentId === currentUser.id)
      : children

  const scopedReminders =
    activeRole === 'parent'
      ? reminders.filter((item) => visibleChildren.some((child) => child.id === item.childId))
      : reminders

  const schedules = visibleChildren.flatMap((child) => buildChildSchedule(child))
  const facilityReports = buildFacilityReports(visibleChildren)
  const deliverySummary = buildDeliverySummary(scopedReminders)
  const completionRate =
    schedules.length === 0
      ? 0
      : Math.round(
          (schedules.filter((item) => item.status === 'completed').length / schedules.length) * 100,
        )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reporting"
        title={activeRole === 'parent' ? 'Care summary' : 'System and facility reporting'}
        description={
          activeRole === 'parent'
            ? 'Parents receive a simplified summary of progress and reminder reliability for the children in their care.'
            : 'Admins and staff can scan facility workload, reminder performance, and coverage progress without leaving the app.'
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricTile
          label="Coverage rate"
          value={`${completionRate}%`}
          hint="Completed doses against generated schedules"
          tone="success"
        />
        <MetricTile
          label="Facilities"
          value={`${facilityReports.length}`}
          hint="Locations represented in this report scope"
        />
        <MetricTile
          label="Reminder channels"
          value={`${deliverySummary.length}`}
          hint="Email and SMS delivery monitoring"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <article className="surface rounded-[32px] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Facility performance
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-slate-950">
            Coverage and pending follow-up
          </h2>
          <div className="mt-6 space-y-4">
            {facilityReports.map((facility) => (
              <div key={facility.facilityName} className="rounded-3xl border border-slate-200 bg-white/70 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{facility.facilityName}</p>
                    <p className="text-sm text-slate-500">{facility.childCount} registered children</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    {facility.pendingAttention} pending
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  {facility.completedDoses} completed doses recorded across the visible schedule set.
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[32px] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Delivery summary
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-slate-950">
            Reminder channels
          </h2>
          <div className="mt-6 space-y-4">
            {deliverySummary.map((channel) => (
              <div key={channel.channel} className="rounded-3xl border border-slate-200 bg-white/70 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-lg font-semibold capitalize text-slate-950">{channel.channel}</p>
                  <p className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                    {channel.successRate} success
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-100 px-3 py-3">
                    <p className="font-semibold text-slate-900">{channel.sent}</p>
                    <p>Sent</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-3">
                    <p className="font-semibold text-slate-900">{channel.queued}</p>
                    <p>Queued</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-3">
                    <p className="font-semibold text-slate-900">{channel.failed}</p>
                    <p>Failed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
