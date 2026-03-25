import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../firebase-admin'
import type {
  ChildDocument,
  ImmunizationScheduleDocument,
  ReminderChannel,
  ReminderDocument,
  ReminderStatus,
  UserProfileDocument,
} from '../types'

export interface ReminderDeliveryResult {
  reminderId: string
  status: 'sent' | 'failed' | 'skipped'
  provider: string | null
  deliveryId: string | null
  reason: string | null
}

export interface TargetReminderEntry {
  id: string
  data: ReminderDocument
}

interface ListTargetRemindersOptions {
  reminderId?: string
  channel: ReminderChannel
}

export function isSendEligibleStatus(status: ReminderStatus, allowRetry: boolean): boolean {
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
    throw new Error('Only staff and admin accounts can trigger reminder sending.')
  }

  return profile
}

export async function listTargetReminders(
  options: ListTargetRemindersOptions,
): Promise<TargetReminderEntry[]> {
  if (options.reminderId) {
    const snapshot = await db.collection('reminders').doc(options.reminderId).get()

    if (!snapshot.exists) {
      return []
    }

    return [{ id: snapshot.id, data: snapshot.data() as ReminderDocument }]
  }

  const querySnapshot = await db
    .collection('reminders')
    .where('channel', '==', options.channel)
    .where('status', '==', 'pending')
    .get()

  return querySnapshot.docs.map((snapshot) => ({
    id: snapshot.id,
    data: snapshot.data() as ReminderDocument,
  }))
}

export async function getChildDocument(
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

export async function getScheduleDocument(
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

export async function markReminderFailed(
  reminderId: string,
  recipient: string | null,
  provider: string | null,
  reason: string,
): Promise<ReminderDeliveryResult> {
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

export async function markReminderSent(
  reminderId: string,
  recipient: string,
  provider: string,
  deliveryId: string | null,
): Promise<ReminderDeliveryResult> {
  const sentAt = new Date().toISOString()

  await db.collection('reminders').doc(reminderId).update({
    recipient,
    status: 'sent',
    sentAt,
    lastAttemptAt: sentAt,
    failureReason: null,
    deliveryProvider: provider,
    deliveryId,
    updatedAt: FieldValue.serverTimestamp(),
  })

  return {
    reminderId,
    status: 'sent',
    provider,
    deliveryId,
    reason: null,
  }
}
