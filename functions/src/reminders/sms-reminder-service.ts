import { logger } from 'firebase-functions'
import type { ChildDocument, ImmunizationScheduleDocument } from '../types'
import { createSmsProvider, getSmsRuntimeConfig } from '../sms/sms-provider-factory'
import { buildReminderSmsMessage } from '../sms/templates/reminder-sms-template'
import {
  getChildDocument,
  getScheduleDocument,
  isSendEligibleStatus,
  listTargetReminders,
  markReminderFailed,
  markReminderSent,
  type ReminderDeliveryResult,
} from './reminder-delivery-utils'

interface ProcessSmsRemindersOptions {
  reminderId?: string
  allowRetry?: boolean
}

export interface SmsReminderDeliveryResult {
  reminderId: string
  status: 'sent' | 'failed' | 'skipped'
  provider: string | null
  deliveryId: string | null
  reason: string | null
}

export interface ProcessSmsRemindersResult {
  attemptedCount: number
  sentCount: number
  failedCount: number
  skippedCount: number
  results: SmsReminderDeliveryResult[]
}

export async function processSmsReminders(
  options: ProcessSmsRemindersOptions = {},
): Promise<ProcessSmsRemindersResult> {
  const runtimeConfig = getSmsRuntimeConfig()
  const provider = createSmsProvider(runtimeConfig)
  const reminders = await listTargetReminders({
    reminderId: options.reminderId,
    channel: 'sms',
  })
  const childCache = new Map<string, ChildDocument>()
  const scheduleCache = new Map<string, ImmunizationScheduleDocument>()
  const results: ReminderDeliveryResult[] = []

  for (const reminder of reminders) {
    if (reminder.data.channel !== 'sms') {
      results.push({
        reminderId: reminder.id,
        status: 'skipped',
        provider: null,
        deliveryId: null,
        reason: 'Reminder is not configured for SMS delivery.',
      })
      continue
    }

    if (!isSendEligibleStatus(reminder.data.status, options.allowRetry ?? false)) {
      results.push({
        reminderId: reminder.id,
        status: 'skipped',
        provider: reminder.data.deliveryProvider,
        deliveryId: reminder.data.deliveryId,
        reason: `Reminder status "${reminder.data.status}" is not eligible for SMS sending.`,
      })
      continue
    }

    const child = await getChildDocument(reminder.data.childId, childCache)
    const schedule = await getScheduleDocument(reminder.data.scheduleId, scheduleCache)
    const resolvedRecipient = child?.parentPhone.trim() ?? ''

    if (!child) {
      results.push(
        await markReminderFailed(reminder.id, reminder.data.recipient, null, 'Child document was not found.'),
      )
      continue
    }

    if (!schedule) {
      results.push(
        await markReminderFailed(
          reminder.id,
          resolvedRecipient || reminder.data.recipient,
          null,
          'Immunization schedule document was not found.',
        ),
      )
      continue
    }

    if (!resolvedRecipient) {
      results.push(
        await markReminderFailed(reminder.id, reminder.data.recipient, null, 'Parent phone number is missing.'),
      )
      continue
    }

    try {
      const message = buildReminderSmsMessage({
        childName: child.fullName,
        vaccineName: schedule.vaccineName,
        dueDate: schedule.dueDate,
        clinicName: runtimeConfig.clinicName || child.hospitalId || 'MedTrack Clinic',
      })
      const delivery = await provider.send({
        to: resolvedRecipient,
        from: runtimeConfig.senderId,
        message,
      })

      results.push(await markReminderSent(reminder.id, resolvedRecipient, delivery.provider, delivery.deliveryId))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown SMS delivery error.'

      logger.error('Failed to send reminder SMS', {
        reminderId: reminder.id,
        error: message,
      })

      results.push(
        await markReminderFailed(reminder.id, resolvedRecipient, runtimeConfig.provider, message),
      )
    }
  }

  return {
    attemptedCount: results.filter((result) => result.status !== 'skipped').length,
    sentCount: results.filter((result) => result.status === 'sent').length,
    failedCount: results.filter((result) => result.status === 'failed').length,
    skippedCount: results.filter((result) => result.status === 'skipped').length,
    results,
  }
}
