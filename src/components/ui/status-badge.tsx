import type { ReminderStatus, ScheduleStatus } from '../../types/domain'

interface StatusBadgeProps {
  status: ReminderStatus | ScheduleStatus
}

const statusStyles: Record<StatusBadgeProps['status'], string> = {
  completed: 'bg-emerald-100 text-emerald-800',
  due: 'bg-amber-100 text-amber-800',
  upcoming: 'bg-sky-100 text-sky-800',
  overdue: 'bg-rose-100 text-rose-800',
  queued: 'bg-slate-200 text-slate-800',
  sent: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-rose-100 text-rose-800',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize tracking-wide ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}
