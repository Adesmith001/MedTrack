import { logger } from 'firebase-functions'
import type { SmsProvider, SmsSendOptions, SmsSendResult } from './sms-provider'

export class ConsoleSmsProvider implements SmsProvider {
  async send(options: SmsSendOptions): Promise<SmsSendResult> {
    logger.info('Console SMS provider preview', {
      to: options.to,
      message: options.message,
    })

    return {
      provider: 'console',
      deliveryId: `console-sms-${Date.now()}`,
    }
  }
}
