import type { EmailProvider, EmailSendOptions, EmailSendResult } from './email-provider'

export class ResendEmailProvider implements EmailProvider {
  constructor(private readonly apiKey: string) {}

  async send(options: EmailSendOptions): Promise<EmailSendResult> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from.name ? `${options.from.name} <${options.from.email}>` : options.from.email,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    })

    if (!response.ok) {
      const details = await response.text()
      throw new Error(`Resend request failed (${response.status}): ${details}`)
    }

    const data = (await response.json()) as { id?: string }

    return {
      provider: 'resend',
      deliveryId: data.id ?? null,
    }
  }
}
