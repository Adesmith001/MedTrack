import type { AsyncStateStatus } from '../entity-state'
import { getNextDueVaccine, hydrateScheduleStatuses } from '../immunization-schedules/schedule-engine'
import { differenceInDays, getTodayIsoDate } from '../../lib/date'
import { childrenService } from '../../services/children-service'
import { immunizationRecordsService } from '../../services/immunization-records-service'
import { immunizationSchedulesService } from '../../services/immunization-schedules-service'
import { remindersService } from '../../services/reminders-service'
import { usersService } from '../../services/users-service'
import type { FirestoreTimestamp } from '../../types/firestore'
import type {
  Child,
  ImmunizationRecord,
  ImmunizationSchedule,
  Reminder,
} from '../../types/models'

const IN_QUERY_LIMIT = 10

export interface DashboardResourceState<TData> {
  status: AsyncStateStatus
  data: TData | null
  error: string | null
}

export interface ParentChildSnapshot {
  child: Child
  nextDue: ImmunizationSchedule | null
  completedCount: number
  totalCount: number
  upcomingReminderCount: number
}

export interface ParentUpcomingReminder {
  reminder: Reminder
  child: Child
  schedule: ImmunizationSchedule | null
}

export interface ParentDashboardData {
  children: Child[]
  childSnapshots: ParentChildSnapshot[]
  upcomingReminders: ParentUpcomingReminder[]
  completedCount: number
  totalScheduleCount: number
  dueSoonCount: number
}

export interface StaffScheduleSnapshot {
  child: Child | null
  schedule: ImmunizationSchedule
}

export interface StaffRecordSnapshot {
  child: Child | null
  record: ImmunizationRecord
}

export interface StaffDashboardData {
  dueToday: StaffScheduleSnapshot[]
  upcoming: StaffScheduleSnapshot[]
  overdue: StaffScheduleSnapshot[]
  recentRecords: StaffRecordSnapshot[]
}

export interface AdminSystemActivity {
  id: string
  title: string
  detail: string
  timestampLabel: string
  timestampMs: number
}

export interface AdminDashboardData {
  totalUsers: number
  totalChildren: number
  totalDueVaccines: number
  totalOverdueVaccines: number
  reminderStats: {
    pending: number
    sent: number
    failed: number
    cancelled: number
  }
  recentActivity: AdminSystemActivity[]
}

function chunkValues<TValue>(values: TValue[], size = IN_QUERY_LIMIT): TValue[][] {
  const chunks: TValue[][] = []

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size))
  }

  return chunks
}

function getTimestampValue(timestamp: FirestoreTimestamp, fallbackIsoDate?: string | null): number {
  if (timestamp) {
    return timestamp.toMillis()
  }

  if (fallbackIsoDate) {
    return new Date(fallbackIsoDate).getTime()
  }

  return 0
}

function formatActivityTime(timestampMs: number): string {
  if (timestampMs <= 0) {
    return 'Pending sync'
  }

  return new Date(timestampMs).toLocaleString()
}

async function listSchedulesByChildIds(
  childIds: string[],
  parentEmail: string,
): Promise<ImmunizationSchedule[]> {
  const chunks = chunkValues(childIds)
  const results = await Promise.all(
    chunks.map((chunk) =>
      immunizationSchedulesService.list({
        filters: [
          { field: 'parentEmail', operator: '==', value: parentEmail },
          { field: 'childId', operator: 'in', value: chunk },
        ],
      }),
    ),
  )

  return hydrateScheduleStatuses(results.flat()).sort((left, right) => left.dueDate.localeCompare(right.dueDate))
}

async function listRemindersByChildIds(
  childIds: string[],
  parentEmail: string,
): Promise<Reminder[]> {
  const chunks = chunkValues(childIds)
  const results = await Promise.all(
    chunks.map((chunk) =>
      remindersService.list({
        filters: [
          { field: 'parentEmail', operator: '==', value: parentEmail },
          { field: 'childId', operator: 'in', value: chunk },
        ],
      }),
    ),
  )

  return results.flat()
}

export async function loadParentDashboardData(parentEmail: string): Promise<ParentDashboardData> {
  const normalizedParentEmail = parentEmail.trim().toLowerCase()
  const children = await childrenService.listByParentEmail(normalizedParentEmail)

  if (children.length === 0) {
    return {
      children: [],
      childSnapshots: [],
      upcomingReminders: [],
      completedCount: 0,
      totalScheduleCount: 0,
      dueSoonCount: 0,
    }
  }

  const childIds = children.map((child) => child.id)
  const [schedules, reminders] = await Promise.all([
    listSchedulesByChildIds(childIds, normalizedParentEmail),
    listRemindersByChildIds(childIds, normalizedParentEmail),
  ])

  const today = getTodayIsoDate()
  const schedulesByChildId = new Map<string, ImmunizationSchedule[]>()

  schedules.forEach((schedule) => {
    const existing = schedulesByChildId.get(schedule.childId) ?? []
    existing.push(schedule)
    schedulesByChildId.set(schedule.childId, existing)
  })

  const childById = new Map(children.map((child) => [child.id, child]))
  const scheduleById = new Map(schedules.map((schedule) => [schedule.id, schedule]))

  const childSnapshots = children
    .map((child) => {
      const childSchedules = schedulesByChildId.get(child.id) ?? []

      return {
        child,
        nextDue: getNextDueVaccine(childSchedules),
        completedCount: childSchedules.filter((schedule) => schedule.status === 'completed').length,
        totalCount: childSchedules.length,
        upcomingReminderCount: reminders.filter(
          (reminder) =>
            reminder.childId === child.id &&
            reminder.status !== 'cancelled' &&
            reminder.status !== 'failed',
        ).length,
      }
    })
    .sort((left, right) => left.child.fullName.localeCompare(right.child.fullName))

  const upcomingReminders = reminders
    .map((reminder) => ({
      reminder,
      child: childById.get(reminder.childId) ?? null,
      schedule: scheduleById.get(reminder.scheduleId) ?? null,
    }))
    .filter(
      (item): item is ParentUpcomingReminder =>
        item.child !== null &&
        item.reminder.status !== 'cancelled' &&
        item.reminder.status !== 'failed' &&
        (item.schedule ? differenceInDays(item.schedule.dueDate, today) >= 0 : true),
    )
    .sort((left, right) => {
      const leftDueDate = left.schedule?.dueDate ?? '9999-12-31'
      const rightDueDate = right.schedule?.dueDate ?? '9999-12-31'
      return leftDueDate.localeCompare(rightDueDate)
    })
    .slice(0, 6)

  return {
    children,
    childSnapshots,
    upcomingReminders,
    completedCount: schedules.filter((schedule) => schedule.status === 'completed').length,
    totalScheduleCount: schedules.length,
    dueSoonCount: schedules.filter((schedule) => schedule.status === 'due' || schedule.status === 'overdue').length,
  }
}

export async function loadStaffDashboardData(): Promise<StaffDashboardData> {
  const [children, schedules, records] = await Promise.all([
    childrenService.list(),
    immunizationSchedulesService.list(),
    immunizationRecordsService.list(),
  ])

  const hydratedSchedules = hydrateScheduleStatuses(schedules)
  const childById = new Map(children.map((child) => [child.id, child]))
  const today = getTodayIsoDate()

  const toScheduleSnapshot = (schedule: ImmunizationSchedule): StaffScheduleSnapshot => ({
    child: childById.get(schedule.childId) ?? null,
    schedule,
  })

  return {
    dueToday: hydratedSchedules
      .filter((schedule) => schedule.status !== 'completed' && schedule.dueDate === today)
      .sort((left, right) => left.vaccineName.localeCompare(right.vaccineName))
      .map(toScheduleSnapshot),
    upcoming: hydratedSchedules
      .filter((schedule) => {
        if (schedule.status === 'completed' || schedule.status === 'overdue' || schedule.dueDate === today) {
          return false
        }

        const daysUntilDue = differenceInDays(schedule.dueDate, today)
        return daysUntilDue > 0 && daysUntilDue <= 7
      })
      .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
      .map(toScheduleSnapshot)
      .slice(0, 8),
    overdue: hydratedSchedules
      .filter((schedule) => schedule.status === 'overdue')
      .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
      .map(toScheduleSnapshot)
      .slice(0, 8),
    recentRecords: [...records]
      .sort(
        (left, right) =>
          getTimestampValue(right.updatedAt, right.dateAdministered) -
          getTimestampValue(left.updatedAt, left.dateAdministered),
      )
      .slice(0, 8)
      .map((record) => ({
        child: childById.get(record.childId) ?? null,
        record,
      })),
  }
}

export async function loadAdminDashboardData(): Promise<AdminDashboardData> {
  const [users, children, schedules, reminders, records] = await Promise.all([
    usersService.list(),
    childrenService.list(),
    immunizationSchedulesService.list(),
    remindersService.list(),
    immunizationRecordsService.list(),
  ])

  const hydratedSchedules = hydrateScheduleStatuses(schedules)
  const childById = new Map(children.map((child) => [child.id, child]))

  const recentActivity: AdminSystemActivity[] = [
    ...users.map((user) => ({
      id: `user-${user.id}`,
      title: 'New user account',
      detail: `${user.fullName} joined as ${user.role}.`,
      timestampMs: getTimestampValue(user.createdAt),
      timestampLabel: formatActivityTime(getTimestampValue(user.createdAt)),
    })),
    ...children.map((child) => ({
      id: `child-${child.id}`,
      title: 'Child registered',
      detail: `${child.fullName} was added under ${child.parentName}.`,
      timestampMs: getTimestampValue(child.createdAt),
      timestampLabel: formatActivityTime(getTimestampValue(child.createdAt)),
    })),
    ...records.map((record) => ({
      id: `record-${record.id}`,
      title: 'Immunization updated',
      detail: `${record.vaccineName} was recorded for ${childById.get(record.childId)?.fullName ?? 'a child profile'}.`,
      timestampMs: getTimestampValue(record.createdAt, record.dateAdministered),
      timestampLabel: formatActivityTime(getTimestampValue(record.createdAt, record.dateAdministered)),
    })),
    ...reminders.map((reminder) => {
      const reminderTimestamp = reminder.lastAttemptAt ?? reminder.sentAt
      const childName = childById.get(reminder.childId)?.fullName ?? 'a child profile'

      return {
        id: `reminder-${reminder.id}`,
        title:
          reminder.status === 'failed'
            ? 'Reminder delivery failed'
            : reminder.status === 'sent'
              ? 'Reminder delivered'
              : 'Reminder queued',
        detail: `${reminder.channel.toUpperCase()} reminder for ${childName} is ${reminder.status}.`,
        timestampMs: getTimestampValue(reminder.updatedAt, reminderTimestamp),
        timestampLabel: formatActivityTime(getTimestampValue(reminder.updatedAt, reminderTimestamp)),
      }
    }),
  ]
    .sort((left, right) => right.timestampMs - left.timestampMs)
    .slice(0, 10)

  return {
    totalUsers: users.length,
    totalChildren: children.length,
    totalDueVaccines: hydratedSchedules.filter((schedule) => schedule.status === 'due').length,
    totalOverdueVaccines: hydratedSchedules.filter((schedule) => schedule.status === 'overdue').length,
    reminderStats: {
      pending: reminders.filter((reminder) => reminder.status === 'pending').length,
      sent: reminders.filter((reminder) => reminder.status === 'sent').length,
      failed: reminders.filter((reminder) => reminder.status === 'failed').length,
      cancelled: reminders.filter((reminder) => reminder.status === 'cancelled').length,
    },
    recentActivity,
  }
}
