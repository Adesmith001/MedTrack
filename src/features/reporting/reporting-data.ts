import { addDays, formatIsoDate, getTodayIsoDate, startOfDay } from '../../lib/date'
import { childrenService } from '../../services/children-service'
import { immunizationRecordsService } from '../../services/immunization-records-service'
import { immunizationSchedulesService } from '../../services/immunization-schedules-service'
import { remindersService } from '../../services/reminders-service'
import { hydrateScheduleStatuses } from '../immunization-schedules/schedule-engine'
import {
  buildCompletionDateFilters,
  buildReminderStatusFilters,
  buildScheduleDateFilters,
  type ReportingFilters,
  type ReportingView,
} from './reporting-filters'
import type { Child, ImmunizationRecord, ImmunizationSchedule, Reminder } from '../../types/models'

const DUE_SOON_WINDOW_DAYS = 14

export interface ScheduleReportItem {
  child: Child
  schedule: ImmunizationSchedule
}

export interface CompletedReportItem {
  child: Child
  record: ImmunizationRecord
}

export interface ReminderHistoryItem {
  child: Child
  schedule: ImmunizationSchedule | null
  reminder: Reminder
}

export interface ReportingDataset {
  dueSoon: ScheduleReportItem[]
  overdue: ScheduleReportItem[]
  completed: CompletedReportItem[]
  reminders: ReminderHistoryItem[]
}

export interface ReportingSummary {
  dueSoon: number
  overdue: number
  completed: number
  reminders: number
}

export interface ReportingWorkspaceData {
  dataset: ReportingDataset
  summary: ReportingSummary
}

function getChildSearchTarget(child: Child): string {
  return `${child.fullName} ${child.parentName} ${child.hospitalId}`.toLowerCase()
}

function matchesChildSearch(child: Child, searchTerm: string): boolean {
  if (!searchTerm) {
    return true
  }

  return getChildSearchTarget(child).includes(searchTerm)
}

function matchesDueDateRange(
  dueDate: string | null,
  from: string,
  to: string,
): boolean {
  if (!dueDate) {
    return !from && !to
  }

  if (from && dueDate < from) {
    return false
  }

  if (to && dueDate > to) {
    return false
  }

  return true
}

function getDueSoonRange(filters: ReportingFilters): { from: string; to: string } {
  const today = getTodayIsoDate()

  return {
    from: filters.dueDateFrom || today,
    to: filters.dueDateTo || formatIsoDate(addDays(startOfDay(today), DUE_SOON_WINDOW_DAYS)),
  }
}

function getOverdueRange(filters: ReportingFilters): { from: string; to: string } {
  const today = getTodayIsoDate()

  return {
    from: filters.dueDateFrom,
    to: filters.dueDateTo || formatIsoDate(addDays(startOfDay(today), -1)),
  }
}

export async function loadReportingWorkspaceData(
  filters: ReportingFilters,
): Promise<ReportingWorkspaceData> {
  const children = await childrenService.list()
  const childById = new Map(children.map((child) => [child.id, child]))
  const normalizedSearch = filters.searchTerm.trim().toLowerCase()
  const [dueSoonSchedules, overdueSchedules, completedRecords, reminders] = await Promise.all([
    immunizationSchedulesService.list({
      filters: buildScheduleDateFilters(getDueSoonRange(filters).from, getDueSoonRange(filters).to),
      sort: [{ field: 'dueDate', direction: 'asc' }],
    }),
    immunizationSchedulesService.list({
      filters: buildScheduleDateFilters(getOverdueRange(filters).from, getOverdueRange(filters).to),
      sort: [{ field: 'dueDate', direction: 'asc' }],
    }),
    immunizationRecordsService.list({
      filters: buildCompletionDateFilters(filters.completionDateFrom, filters.completionDateTo),
      sort: [{ field: 'dateAdministered', direction: 'desc' }],
    }),
    remindersService.list({
      filters: buildReminderStatusFilters(filters.reminderStatus),
      sort: [{ field: 'updatedAt', direction: 'desc' }],
    }),
  ])

  const hydratedDueSoon = hydrateScheduleStatuses(dueSoonSchedules)
  const hydratedOverdue = hydrateScheduleStatuses(overdueSchedules)
  const reminderScheduleIds = [...new Set(reminders.map((reminder) => reminder.scheduleId))]
  const reminderSchedules = (
    await Promise.all(reminderScheduleIds.map((scheduleId) => immunizationSchedulesService.getById(scheduleId)))
  ).filter((schedule): schedule is ImmunizationSchedule => schedule !== null)
  const reminderScheduleById = new Map(reminderSchedules.map((schedule) => [schedule.id, schedule]))

  const dueSoon = hydratedDueSoon
    .filter((schedule) => schedule.status !== 'completed')
    .filter((schedule) => (filters.vaccineStatus === 'all' ? true : schedule.status === filters.vaccineStatus))
    .map((schedule) => ({
      child: childById.get(schedule.childId) ?? null,
      schedule,
    }))
    .filter((item): item is ScheduleReportItem => item.child !== null)
    .filter((item) => matchesChildSearch(item.child, normalizedSearch))

  const overdue = hydratedOverdue
    .filter((schedule) => schedule.status === 'overdue')
    .filter((schedule) => (filters.vaccineStatus === 'all' ? true : schedule.status === filters.vaccineStatus))
    .map((schedule) => ({
      child: childById.get(schedule.childId) ?? null,
      schedule,
    }))
    .filter((item): item is ScheduleReportItem => item.child !== null)
    .filter((item) => matchesChildSearch(item.child, normalizedSearch))

  const completed = completedRecords
    .map((record) => ({
      child: childById.get(record.childId) ?? null,
      record,
    }))
    .filter((item): item is CompletedReportItem => item.child !== null)
    .filter((item) => matchesChildSearch(item.child, normalizedSearch))

  const reminderHistory = reminders
    .map((reminder) => ({
      child: childById.get(reminder.childId) ?? null,
      schedule: reminderScheduleById.get(reminder.scheduleId) ?? null,
      reminder,
    }))
    .filter((item): item is ReminderHistoryItem => item.child !== null)
    .filter((item) => matchesChildSearch(item.child, normalizedSearch))
    .filter((item) => matchesDueDateRange(item.schedule?.dueDate ?? null, filters.dueDateFrom, filters.dueDateTo))

  return {
    dataset: {
      dueSoon,
      overdue,
      completed,
      reminders: reminderHistory,
    },
    summary: {
      dueSoon: dueSoon.length,
      overdue: overdue.length,
      completed: completed.length,
      reminders: reminderHistory.length,
    },
  }
}

export function getActiveReportCount(
  view: ReportingView,
  summary: ReportingSummary,
): number {
  return summary[view]
}
