import type { SmsProvider, SmsSendOptions, SmsSendResult } from './sms-provider'

export class TermiiSmsProvider implements SmsProvider {
  constructor(
    private readonly apiKey: string,
    private readonly senderId: string,
  ) {}

  async send(options: SmsSendOptions): Promise<SmsSendResult> {
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        to: options.to,
        from: options.from || this.senderId,
        sms: options.message,
        type: 'plain',
        channel: 'generic',
      }),
    })

    if (!response.ok) {
      const details = await response.text()
      throw new Error(`Termii request failed (${response.status}): ${details}`)
    }

    const data = (await response.json()) as {
      message_id?: string
      messageId?: string
      code?: string
    }

    return {
      provider: 'termii',
      deliveryId: data.message_id ?? data.messageId ?? data.code ?? null,
    }
  }
}
