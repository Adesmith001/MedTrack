import { httpsCallable } from 'firebase/functions'
import { functions } from '../lib/firebase'

export interface SendSmsRemindersRequest {
  reminderId?: string
}

export interface SmsReminderDeliveryResult {
  reminderId: string
  status: 'sent' | 'failed' | 'skipped'
  provider: string | null
  deliveryId: string | null
  reason: string | null
}

export interface SendSmsRemindersResponse {
  attemptedCount: number
  sentCount: number
  failedCount: number
  skippedCount: number
  results: SmsReminderDeliveryResult[]
}

export const reminderSmsService = {
  async sendNow(payload: SendSmsRemindersRequest = {}): Promise<SendSmsRemindersResponse> {
    if (!functions) {
      throw new Error(
        'Firebase Functions is not initialized. Set the required VITE_FIREBASE_* values before sending SMS reminders.',
      )
    }

    const callable = httpsCallable<SendSmsRemindersRequest, SendSmsRemindersResponse>(
      functions,
      'sendSmsReminders',
    )
    const result = await callable(payload)
    return result.data
  },
}
