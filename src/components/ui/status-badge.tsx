import type { ImmunizationScheduleStatus } from '../../types/models'

interface StatusBadgeProps {
  status: ImmunizationScheduleStatus
}

const statusStyles: Record<ImmunizationScheduleStatus, string> = {
  upcoming: 'bg-sky-100 text-sky-700',
  due: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-rose-100 text-rose-700',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}
