import { logger } from 'firebase-functions'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { assertStaffOrAdmin, processEmailReminders } from './reminders/email-reminder-service'

const runtimeOptions = {
  region: 'us-central1',
  timeoutSeconds: 120 as const,
}

export const sendEmailReminders = onCall(runtimeOptions, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in to send reminder emails.')
  }

  try {
    await assertStaffOrAdmin(request.auth.uid)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'You are not allowed to send reminder emails.'
    throw new HttpsError('permission-denied', message)
  }

  const reminderId = typeof request.data?.reminderId === 'string' ? request.data.reminderId : undefined

  return processEmailReminders({
    reminderId,
    allowRetry: true,
  })
})

export const processPendingEmailReminders = onSchedule(
  {
    ...runtimeOptions,
    schedule: 'every 15 minutes',
  },
  async () => {
    const result = await processEmailReminders()

    logger.info('Processed pending email reminders', result)
  },
)
