import { addDays, differenceInDays, formatIsoDate, getTodayIsoDate, parseIsoDate } from '../../lib/date'
import type { CreateDocumentInput } from '../../types/firestore'
import type { Child, ImmunizationSchedule, ImmunizationScheduleStatus } from '../../types/models'
import type { VaccineDefinition } from './vaccine-definitions'

export const DUE_SOON_WINDOW_DAYS = 7

export function computeDueDate(dateOfBirth: string, offsetDays: number): string {
  return formatIsoDate(addDays(parseIsoDate(dateOfBirth), offsetDays))
}

export function determineScheduleStatus(
  dueDate: string,
  existingStatus?: ImmunizationScheduleStatus,
  referenceDate = getTodayIsoDate(),
): ImmunizationScheduleStatus {
  if (existingStatus === 'completed') {
    return 'completed'
  }

  const daysUntilDue = differenceInDays(dueDate, referenceDate)

  if (daysUntilDue < 0) {
    return 'overdue'
  }

  if (daysUntilDue <= DUE_SOON_WINDOW_DAYS) {
    return 'due'
  }

  return 'upcoming'
}

export function generateScheduleEntriesForChild(
  child: Pick<Child, 'id' | 'dateOfBirth'>,
  definitions: VaccineDefinition[],
  referenceDate = getTodayIsoDate(),
): CreateDocumentInput<ImmunizationSchedule>[] {
  return definitions.map((definition) => {
    const dueDate = computeDueDate(child.dateOfBirth, definition.offsetDays)

    return {
      childId: child.id,
      vaccineName: definition.vaccineName,
      recommendedAge: definition.recommendedAge,
      dueDate,
      status: determineScheduleStatus(dueDate, undefined, referenceDate),
      notes: definition.notes ?? '',
    }
  })
}

export function hydrateScheduleStatuses(
  schedules: ImmunizationSchedule[],
  referenceDate = getTodayIsoDate(),
): ImmunizationSchedule[] {
  return schedules.map((schedule) => ({
    ...schedule,
    status: determineScheduleStatus(schedule.dueDate, schedule.status, referenceDate),
  }))
}

export function getNextDueVaccine(
  schedules: ImmunizationSchedule[],
  referenceDate = getTodayIsoDate(),
): ImmunizationSchedule | null {
  const hydrated = hydrateScheduleStatuses(schedules, referenceDate)

  return (
    hydrated
      .filter((schedule) => schedule.status !== 'completed')
      .sort((left, right) => left.dueDate.localeCompare(right.dueDate))[0] ?? null
  )
}

export function getOverdueVaccines(
  schedules: ImmunizationSchedule[],
  referenceDate = getTodayIsoDate(),
): ImmunizationSchedule[] {
  return hydrateScheduleStatuses(schedules, referenceDate)
    .filter((schedule) => schedule.status === 'overdue')
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
}
