import { differenceInDays, getTodayIsoDate } from '../../lib/date'
import type { ReminderTriggerType } from '../../types/models'

export interface ReminderRuleDefinition {
  triggerType: Exclude<ReminderTriggerType, 'manual'>
  daysBeforeDue: number
  label: string
}

export const reminderRuleDefinitions: ReminderRuleDefinition[] = [
  {
    triggerType: '7-days-before',
    daysBeforeDue: 7,
    label: '7 days before due date',
  },
  {
    triggerType: '3-days-before',
    daysBeforeDue: 3,
    label: '3 days before due date',
  },
  {
    triggerType: '1-day-before',
    daysBeforeDue: 1,
    label: '1 day before due date',
  },
  {
    triggerType: 'on-due-date',
    daysBeforeDue: 0,
    label: 'On due date',
  },
]

export function getReminderRulesForDueDate(
  dueDate: string,
  referenceDate = getTodayIsoDate(),
): ReminderRuleDefinition[] {
  const daysUntilDue = differenceInDays(dueDate, referenceDate)

  return reminderRuleDefinitions.filter((rule) => rule.daysBeforeDue === daysUntilDue)
}

export function formatReminderTriggerType(triggerType: ReminderTriggerType): string {
  if (triggerType === 'manual') {
    return 'Manual'
  }

  return (
    reminderRuleDefinitions.find((rule) => rule.triggerType === triggerType)?.label ?? triggerType
  )
}
