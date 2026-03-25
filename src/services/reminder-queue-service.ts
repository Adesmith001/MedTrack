import { getTodayIsoDate } from '../lib/date'
import { childrenService } from './children-service'
import { immunizationSchedulesService } from './immunization-schedules-service'
import { buildPendingReminderPayloads } from '../features/reminders/reminder-queue'
import { remindersService } from './reminders-service'
import type { Reminder } from '../types/models'

export interface GenerateReminderQueueOptions {
  referenceDate?: string
}

export interface GenerateReminderQueueResult {
  created: Reminder[]
  createdCount: number
  eligibleCount: number
  duplicateCount: number
  referenceDate: string
}

export const reminderQueueService = {
  async generatePending(options: GenerateReminderQueueOptions = {}): Promise<GenerateReminderQueueResult> {
    const referenceDate = options.referenceDate ?? getTodayIsoDate()
    const [children, schedules, existingReminders] = await Promise.all([
      childrenService.list(),
      immunizationSchedulesService.list(),
      remindersService.list(),
    ])

    const queueBuild = buildPendingReminderPayloads(
      children,
      schedules,
      existingReminders,
      referenceDate,
    )

    await Promise.all(
      queueBuild.payloads.map((payload) => remindersService.set(payload.id, payload.data)),
    )

    const created = (
      await Promise.all(
        queueBuild.payloads.map(async (payload) => remindersService.getById(payload.id)),
      )
    ).filter((reminder): reminder is Reminder => reminder !== null)

    return {
      created,
      createdCount: created.length,
      eligibleCount: queueBuild.eligibleCount,
      duplicateCount: queueBuild.duplicateCount,
      referenceDate,
    }
  },
}
