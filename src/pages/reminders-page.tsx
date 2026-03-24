import { PageHeader } from '../components/layout/page-header'
import { MetricTile } from '../components/ui/metric-tile'
import { StatusBadge } from '../components/ui/status-badge'
import { setReminderFilter } from '../features/reminders/reminders-slice'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { formatDateTime } from '../lib/date'
import type { ReminderStatus } from '../types/domain'

const filters: Array<ReminderStatus | 'all'> = ['all', 'queued', 'sent', 'failed']

export function RemindersPage() {
  const dispatch = useAppDispatch()
  const activeRole = useAppSelector((state) => state.auth.activeRole)
  const currentUser = useAppSelector((state) => state.auth.profiles[state.auth.activeRole])
  const children = useAppSelector((state) => state.children.items)
  const reminders = useAppSelector((state) => state.reminders.items)
  const statusFilter = useAppSelector((state) => state.reminders.statusFilter)

  const visibleChildren =
    activeRole === 'parent'
      ? children.filter((child) => child.parentId === currentUser.id)
      : children

  const scopedReminders =
    activeRole === 'parent'
      ? reminders.filter((item) => visibleChildren.some((child) => child.id === item.childId))
      : reminders

  const filteredReminders =
    statusFilter === 'all'
      ? scopedReminders
      : scopedReminders.filter((item) => item.status === statusFilter)

  const queued = scopedReminders.filter((item) => item.status === 'queued').length
  const sent = scopedReminders.filter((item) => item.status === 'sent').length
  const failed = scopedReminders.filter((item) => item.status === 'failed').length

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reminder operations"
        title="Automated email and SMS queue"
        description="Review outgoing reminder traffic, delivery failures, and guardian contact targets before jobs are moved to Cloud Functions."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricTile label="Queued" value={`${queued}`} hint="Ready for dispatch" />
        <MetricTile label="Sent" value={`${sent}`} hint="Confirmed reminder deliveries" tone="success" />
        <MetricTile label="Failed" value={`${failed}`} hint="Requires contact verification" tone="warning" />
      </section>

      <section className="surface rounded-[32px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => dispatch(setReminderFilter(filter))}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                  filter === statusFilter
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-500">
            {filteredReminders.length} reminder{filteredReminders.length === 1 ? '' : 's'} in view
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {filteredReminders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No reminders match the active filter.
            </div>
          ) : (
            filteredReminders.map((item) => (
              <div
                key={item.id}
                className="grid gap-4 rounded-3xl border border-slate-200 bg-white/70 p-5 lg:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-950">{item.childName}</h2>
                    <StatusBadge status={item.status} />
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {item.channel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {item.guardianName} | {item.target}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{item.message}</p>
                </div>
                <div className="space-y-2 text-sm text-slate-500 lg:text-right">
                  <p>Scheduled {formatDateTime(item.scheduledFor)}</p>
                  <p>{item.sentAt ? `Sent ${formatDateTime(item.sentAt)}` : 'Waiting for delivery'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
