import type { SmsProvider, SmsSendOptions, SmsSendResult } from './sms-provider'

export class TwilioSmsProvider implements SmsProvider {
  constructor(
    private readonly accountSid: string,
    private readonly authToken: string,
    private readonly fromNumber: string,
  ) {}

  async send(options: SmsSendOptions): Promise<SmsSendResult> {
    const body = new URLSearchParams({
      To: options.to,
      From: options.from || this.fromNumber,
      Body: options.message,
    })
    const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      },
    )

    if (!response.ok) {
      const details = await response.text()
      throw new Error(`Twilio request failed (${response.status}): ${details}`)
    }

    const data = (await response.json()) as { sid?: string }

    return {
      provider: 'twilio',
      deliveryId: data.sid ?? null,
    }
  }
}
