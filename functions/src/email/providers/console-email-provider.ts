import { logger } from 'firebase-functions'
import type { EmailProvider, EmailSendOptions, EmailSendResult } from './email-provider'

export class ConsoleEmailProvider implements EmailProvider {
  async send(options: EmailSendOptions): Promise<EmailSendResult> {
    logger.info('Console email provider preview', {
      to: options.to,
      subject: options.subject,
    })

    return {
      provider: 'console',
      deliveryId: `console-${Date.now()}`,
    }
  }
}
