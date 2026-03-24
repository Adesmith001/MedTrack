import { PageHeader } from '../components/layout/page-header'
import { MetricTile } from '../components/ui/metric-tile'
import { StatusBadge } from '../components/ui/status-badge'
import { buildDashboardMetrics } from '../features/dashboard/metrics'
import { getNextPendingScheduleItem } from '../features/immunizations/schedule'
import { useAppSelector } from '../hooks/redux'
import { calculateAgeLabel, formatDate, formatDateTime } from '../lib/date'

const descriptions = {
  parent:
    'Track each child profile, confirm upcoming visits, and follow reminder activity without switching between tools.',
  staff:
    'Stay ahead of clinic flow with child records, pending vaccine doses, and reminder queues in one operational view.',
  admin:
    'Monitor facility activity, reminder reliability, and immunization progress across the system from a single command view.',
}

export function DashboardPage() {
  const activeRole = useAppSelector((state) => state.auth.activeRole)
  const currentUser = useAppSelector((state) => state.auth.profiles[state.auth.activeRole])
  const allChildren = useAppSelector((state) => state.children.items)
  const reminders = useAppSelector((state) => state.reminders.items)

  const visibleChildren =
    activeRole === 'parent'
      ? allChildren.filter((child) => child.parentId === currentUser.id)
      : allChildren

  const roleReminders =
    activeRole === 'parent'
      ? reminders.filter((item) => visibleChildren.some((child) => child.id === item.childId))
      : reminders

  const metrics = buildDashboardMetrics(activeRole, visibleChildren, roleReminders)
  const attentionItems = visibleChildren
    .map((child) => ({
      child,
      nextItem: getNextPendingScheduleItem(child),
    }))
    .filter((entry) => entry.nextItem)
    .sort((left, right) => left.nextItem!.dueDate.localeCompare(right.nextItem!.dueDate))

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${activeRole} workspace`}
        title={`Hello, ${currentUser.name.split(' ')[0]}`}
        description={descriptions[activeRole]}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricTile key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <article className="surface rounded-[32px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Upcoming schedule
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-950">
                Children who need attention next
              </h2>
            </div>
            <div className="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
              {attentionItems.length} active follow-ups
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {attentionItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                No children are currently due for a vaccine in this role view.
              </div>
            ) : (
              attentionItems.map(({ child, nextItem }) => (
                <div
                  key={child.id}
                  className="grid gap-4 rounded-3xl border border-slate-200 bg-white/70 p-5 md:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-950">{child.fullName}</h3>
                      <StatusBadge status={nextItem!.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {calculateAgeLabel(child.birthDate)} old | Next visit {formatDate(child.nextAppointment)}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {nextItem!.vaccineName} {nextItem!.doseLabel} is scheduled for {formatDate(nextItem!.dueDate)}.
                    </p>
                  </div>
                  <div className="flex items-start justify-between gap-4 md:flex-col md:items-end">
                    <p className="text-sm font-semibold text-slate-700">{nextItem!.ageLabel}</p>
                    <p className="text-sm text-slate-500">{child.facilityName}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="surface rounded-[32px] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Reminder queue
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-slate-950">
            Delivery activity
          </h2>

          <div className="mt-6 space-y-4">
            {roleReminders.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-200 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{item.childName}</p>
                    <p className="text-sm text-slate-500">{item.channel.toUpperCase()} to {item.target}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.message}</p>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Scheduled {formatDateTime(item.scheduledFor)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
