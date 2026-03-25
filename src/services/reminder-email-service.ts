import { httpsCallable } from 'firebase/functions'
import { functions } from '../lib/firebase'

export interface SendEmailRemindersRequest {
  reminderId?: string
}

export interface EmailReminderDeliveryResult {
  reminderId: string
  status: 'sent' | 'failed' | 'skipped'
  provider: string | null
  deliveryId: string | null
  reason: string | null
}

export interface SendEmailRemindersResponse {
  attemptedCount: number
  sentCount: number
  failedCount: number
  skippedCount: number
  results: EmailReminderDeliveryResult[]
}

export const reminderEmailService = {
  async sendNow(payload: SendEmailRemindersRequest = {}): Promise<SendEmailRemindersResponse> {
    if (!functions) {
      throw new Error(
        'Firebase Functions is not initialized. Set the required VITE_FIREBASE_* values before sending email reminders.',
      )
    }

    const callable = httpsCallable<SendEmailRemindersRequest, SendEmailRemindersResponse>(
      functions,
      'sendEmailReminders',
    )
    const result = await callable(payload)
    return result.data
  },
}
