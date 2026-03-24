import { buildChildSchedule, getNextPendingScheduleItem } from '../immunizations/schedule'
import type { ChildProfile, ReminderRecord, UserRole } from '../../types/domain'

export interface DashboardMetric {
  label: string
  value: string
  hint: string
  tone: 'neutral' | 'success' | 'warning'
}

export function buildDashboardMetrics(
  role: UserRole,
  children: ChildProfile[],
  reminders: ReminderRecord[],
): DashboardMetric[] {
  const schedules = children.flatMap((child) => buildChildSchedule(child))
  const completed = schedules.filter((item) => item.status === 'completed').length
  const dueSoon = children.filter((child) => {
    const nextItem = getNextPendingScheduleItem(child)
    return nextItem?.status === 'due' || nextItem?.status === 'overdue'
  }).length
  const queuedReminders = reminders.filter((item) => item.status === 'queued').length
  const failedReminders = reminders.filter((item) => item.status === 'failed').length

  const roleLabel =
    role === 'parent' ? 'children in care' : role === 'staff' ? 'active child profiles' : 'tracked profiles'

  return [
    {
      label: roleLabel,
      value: `${children.length}`,
      hint: 'Current workspace scope',
      tone: 'neutral',
    },
    {
      label: 'Completed doses',
      value: `${completed}`,
      hint: 'Recorded in the current schedule set',
      tone: 'success',
    },
    {
      label: 'Need attention',
      value: `${dueSoon}`,
      hint: 'Children with due or overdue doses',
      tone: 'warning',
    },
    {
      label: role === 'admin' ? 'Reminder incidents' : 'Queued reminders',
      value: `${role === 'admin' ? failedReminders : queuedReminders}`,
      hint: role === 'admin' ? 'Failed reminder deliveries' : 'Messages waiting to be sent',
      tone: role === 'admin' ? 'warning' : 'neutral',
    },
  ]
}
