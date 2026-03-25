import type { FirestoreQueryFilter } from '../../types/firestore'
import type {
  ImmunizationRecord,
  ImmunizationSchedule,
  ImmunizationScheduleStatus,
  Reminder,
  ReminderStatus,
} from '../../types/models'

export type ReportingView = 'dueSoon' | 'overdue' | 'completed' | 'reminders'

export type VaccineStatusFilter = ImmunizationScheduleStatus | 'all'
export type ReminderStatusFilter = ReminderStatus | 'all'

export interface ReportingFilters {
  searchTerm: string
  vaccineStatus: VaccineStatusFilter
  reminderStatus: ReminderStatusFilter
  dueDateFrom: string
  dueDateTo: string
  completionDateFrom: string
  completionDateTo: string
}

export const defaultReportingFilters: ReportingFilters = {
  searchTerm: '',
  vaccineStatus: 'all',
  reminderStatus: 'all',
  dueDateFrom: '',
  dueDateTo: '',
  completionDateFrom: '',
  completionDateTo: '',
}

export const reportingViewLabels: Record<ReportingView, string> = {
  dueSoon: 'Vaccines due soon',
  overdue: 'Overdue immunizations',
  completed: 'Completed immunizations',
  reminders: 'Reminder delivery history',
}

export function buildDateRangeFilters<TDocument>(
  field: Extract<keyof TDocument, string>,
  from: string,
  to: string,
): FirestoreQueryFilter<TDocument>[] {
  const filters: FirestoreQueryFilter<TDocument>[] = []

  if (from) {
    filters.push({
      field,
      operator: '>=',
      value: from,
    })
  }

  if (to) {
    filters.push({
      field,
      operator: '<=',
      value: to,
    })
  }

  return filters
}

export function buildScheduleDateFilters(
  from: string,
  to: string,
): FirestoreQueryFilter<ImmunizationSchedule>[] {
  return buildDateRangeFilters<ImmunizationSchedule>('dueDate', from, to)
}

export function buildCompletionDateFilters(
  from: string,
  to: string,
): FirestoreQueryFilter<ImmunizationRecord>[] {
  return buildDateRangeFilters<ImmunizationRecord>('dateAdministered', from, to)
}

export function buildReminderStatusFilters(
  status: ReminderStatusFilter,
): FirestoreQueryFilter<Reminder>[] {
  if (status === 'all') {
    return []
  }

  return [
    {
      field: 'status',
      operator: '==',
      value: status,
    },
  ]
}

