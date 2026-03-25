import type { ImmunizationScheduleStatus } from '../../types/models'
import { Badge } from './badge'

interface StatusBadgeProps {
  status: ImmunizationScheduleStatus
}

const statusStyles: Record<ImmunizationScheduleStatus, 'info' | 'warning' | 'success'> = {
  upcoming: 'info',
  due: 'warning',
  completed: 'success',
  overdue: 'warning',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={statusStyles[status]}>{status}</Badge>
}
