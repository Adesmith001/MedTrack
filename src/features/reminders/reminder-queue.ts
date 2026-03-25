import { formatDisplayDate, getTodayIsoDate } from '../../lib/date'
import type { CreateDocumentInput } from '../../types/firestore'
import type { Child, ImmunizationSchedule, Reminder, ReminderChannel } from '../../types/models'
import { hydrateScheduleStatuses } from '../immunization-schedules/schedule-engine'
import { getReminderRulesForDueDate } from './reminder-rules'

interface ReminderRecipient {
  channel: ReminderChannel
  recipient: string
}

export interface ReminderQueueBuildResult {
  payloads: Array<{
    id: string
    data: CreateDocumentInput<Reminder>
  }>
  eligibleCount: number
  duplicateCount: number
}

function getReminderRecipients(child: Child): ReminderRecipient[] {
  const recipients: ReminderRecipient[] = []
  const email = child.parentEmail.trim().toLowerCase()
  const phone = child.parentPhone.trim()

  if (email) {
    recipients.push({
      channel: 'email',
      recipient: email,
    })
  }

  if (phone) {
    recipients.push({
      channel: 'sms',
      recipient: phone,
    })
  }

  return recipients
}

export function createReminderQueueKey(
  scheduleId: string,
  triggerType: Reminder['triggerType'],
  channel: Reminder['channel'],
): string {
  return `${scheduleId}__${triggerType}__${channel}`
}

export function createReminderDocumentId(
  scheduleId: string,
  triggerType: Reminder['triggerType'],
  channel: Reminder['channel'],
): string {
  return `queue_${createReminderQueueKey(scheduleId, triggerType, channel)}`
}

export function buildReminderMessage(
  child: Child,
  schedule: ImmunizationSchedule,
  channel: ReminderChannel,
  triggerLabel: string,
): string {
  const prefix = channel === 'sms' ? 'MedTrack reminder:' : 'MedTrack reminder'

  return `${prefix} ${child.fullName} is scheduled for ${schedule.vaccineName} ${triggerLabel.toLowerCase()}. Due date: ${formatDisplayDate(schedule.dueDate)}.`
}

export function buildPendingReminderPayloads(
  children: Child[],
  schedules: ImmunizationSchedule[],
  existingReminders: Reminder[],
  referenceDate = getTodayIsoDate(),
): ReminderQueueBuildResult {
  const childMap = new Map(children.map((child) => [child.id, child]))
  const existingKeys = new Set(
    existingReminders.map((reminder) =>
      createReminderQueueKey(reminder.scheduleId, reminder.triggerType, reminder.channel),
    ),
  )

  const payloads: ReminderQueueBuildResult['payloads'] = []
  let eligibleCount = 0
  let duplicateCount = 0

  hydrateScheduleStatuses(schedules, referenceDate)
    .filter((schedule) => schedule.status !== 'completed')
    .forEach((schedule) => {
      const child = childMap.get(schedule.childId)

      if (!child) {
        return
      }

      const rules = getReminderRulesForDueDate(schedule.dueDate, referenceDate)
      const recipients = getReminderRecipients(child)

      rules.forEach((rule) => {
        recipients.forEach(({ channel, recipient }) => {
          eligibleCount += 1

          const reminderKey = createReminderQueueKey(schedule.id, rule.triggerType, channel)

          if (existingKeys.has(reminderKey)) {
            duplicateCount += 1
            return
          }

          existingKeys.add(reminderKey)
          payloads.push({
            id: createReminderDocumentId(schedule.id, rule.triggerType, channel),
            data: {
              childId: child.id,
              scheduleId: schedule.id,
              channel,
              triggerType: rule.triggerType,
              status: 'pending',
              recipient,
              message: buildReminderMessage(child, schedule, channel, rule.label),
              sentAt: null,
              lastAttemptAt: null,
              failureReason: null,
              deliveryProvider: null,
              deliveryId: null,
            },
          })
        })
      })
    })

  return {
    payloads,
    eligibleCount,
    duplicateCount,
  }
}
