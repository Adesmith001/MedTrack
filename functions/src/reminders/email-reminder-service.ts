import { FieldValue } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'
import { db } from '../firebase-admin'
import { createEmailProvider, getEmailRuntimeConfig } from '../email/email-provider-factory'
import { buildReminderEmailTemplate } from '../email/templates/reminder-email-template'
import type {
  ChildDocument,
  ImmunizationScheduleDocument,
  ReminderDocument,
  ReminderStatus,
  UserProfileDocument,
} from '../types'

interface ProcessEmailRemindersOptions {
  reminderId?: string
  allowRetry?: boolean
}

export interface EmailReminderDeliveryResult {
  reminderId: string
  status: 'sent' | 'failed' | 'skipped'
  provider: string | null
  deliveryId: string | null
  reason: string | null
}

export interface ProcessEmailRemindersResult {
  attemptedCount: number
  sentCount: number
  failedCount: number
  skippedCount: number
  results: EmailReminderDeliveryResult[]
}

function isSendEligibleStatus(status: ReminderStatus, allowRetry: boolean): boolean {
  return status === 'pending' || (allowRetry && status === 'failed')
}

async function getUserProfile(uid: string): Promise<UserProfileDocument | null> {
  const snapshot = await db.collection('users').doc(uid).get()

  if (!snapshot.exists) {
    return null
  }

  return snapshot.data() as UserProfileDocument
}

export async function assertStaffOrAdmin(uid: string): Promise<UserProfileDocument> {
  const profile = await getUserProfile(uid)

  if (!profile || (profile.role !== 'staff' && profile.role !== 'admin')) {
    throw new Error('Only staff and admin accounts can trigger email reminder sending.')
  }

  return profile
}

async function listTargetReminders(options: ProcessEmailRemindersOptions): Promise<
  Array<{
    id: string
    data: ReminderDocument
  }>
> {
  if (options.reminderId) {
    const snapshot = await db.collection('reminders').doc(options.reminderId).get()

    if (!snapshot.exists) {
      return []
    }

    return [{ id: snapshot.id, data: snapshot.data() as ReminderDocument }]
  }

  const querySnapshot = await db
    .collection('reminders')
    .where('channel', '==', 'email')
    .where('status', '==', 'pending')
    .get()

  return querySnapshot.docs.map((snapshot) => ({
    id: snapshot.id,
    data: snapshot.data() as ReminderDocument,
  }))
}

async function getChildDocument(
  childId: string,
  cache: Map<string, ChildDocument>,
): Promise<ChildDocument | null> {
  const cached = cache.get(childId)

  if (cached) {
    return cached
  }

  const snapshot = await db.collection('children').doc(childId).get()

  if (!snapshot.exists) {
    return null
  }

  const child = snapshot.data() as ChildDocument
  cache.set(childId, child)
  return child
}

async function getScheduleDocument(
  scheduleId: string,
  cache: Map<string, ImmunizationScheduleDocument>,
): Promise<ImmunizationScheduleDocument | null> {
  const cached = cache.get(scheduleId)

  if (cached) {
    return cached
  }

  const snapshot = await db.collection('immunizationSchedules').doc(scheduleId).get()

  if (!snapshot.exists) {
    return null
  }

  const schedule = snapshot.data() as ImmunizationScheduleDocument
  cache.set(scheduleId, schedule)
  return schedule
}

async function markReminderFailed(
  reminderId: string,
  recipient: string | null,
  provider: string | null,
  reason: string,
): Promise<EmailReminderDeliveryResult> {
  const attemptedAt = new Date().toISOString()

  await db.collection('reminders').doc(reminderId).update({
    recipient: recipient ?? '',
    status: 'failed',
    sentAt: null,
    lastAttemptAt: attemptedAt,
    failureReason: reason,
    deliveryProvider: provider,
    deliveryId: null,
    updatedAt: FieldValue.serverTimestamp(),
  })

  return {
    reminderId,
    status: 'failed',
    provider,
    deliveryId: null,
    reason,
  }
}

export async function processEmailReminders(
  options: ProcessEmailRemindersOptions = {},
): Promise<ProcessEmailRemindersResult> {
  const runtimeConfig = getEmailRuntimeConfig()
  const provider = createEmailProvider(runtimeConfig)
  const reminders = await listTargetReminders(options)
  const childCache = new Map<string, ChildDocument>()
  const scheduleCache = new Map<string, ImmunizationScheduleDocument>()
  const results: EmailReminderDeliveryResult[] = []

  for (const reminder of reminders) {
    if (reminder.data.channel !== 'email') {
      results.push({
        reminderId: reminder.id,
        status: 'skipped',
        provider: null,
        deliveryId: null,
        reason: 'Reminder is not configured for email delivery.',
      })
      continue
    }

    if (!isSendEligibleStatus(reminder.data.status, options.allowRetry ?? false)) {
      results.push({
        reminderId: reminder.id,
        status: 'skipped',
        provider: reminder.data.deliveryProvider,
        deliveryId: reminder.data.deliveryId,
        reason: `Reminder status "${reminder.data.status}" is not eligible for email sending.`,
      })
      continue
    }

    const child = await getChildDocument(reminder.data.childId, childCache)
    const schedule = await getScheduleDocument(reminder.data.scheduleId, scheduleCache)
    const resolvedRecipient = child?.parentEmail.trim().toLowerCase() ?? ''

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
        await markReminderFailed(reminder.id, reminder.data.recipient, null, 'Parent email is missing.'),
      )
      continue
    }

    try {
      const template = buildReminderEmailTemplate({
        childName: child.fullName,
        vaccineName: schedule.vaccineName,
        dueDate: schedule.dueDate,
        clinicName: runtimeConfig.clinicName || child.hospitalId || 'MedTrack Immunization Clinic',
        reminderMessage: reminder.data.message,
        parentName: child.parentName,
      })
      const delivery = await provider.send({
        to: resolvedRecipient,
        from: {
          email: runtimeConfig.fromAddress,
          name: runtimeConfig.fromName,
        },
        subject: template.subject,
        html: template.html,
        text: template.text,
      })
      const sentAt = new Date().toISOString()

      await db.collection('reminders').doc(reminder.id).update({
        recipient: resolvedRecipient,
        status: 'sent',
        sentAt,
        lastAttemptAt: sentAt,
        failureReason: null,
        deliveryProvider: delivery.provider,
        deliveryId: delivery.deliveryId,
        updatedAt: FieldValue.serverTimestamp(),
      })

      results.push({
        reminderId: reminder.id,
        status: 'sent',
        provider: delivery.provider,
        deliveryId: delivery.deliveryId,
        reason: null,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown email delivery error.'

      logger.error('Failed to send reminder email', {
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
