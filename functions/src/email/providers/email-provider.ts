export interface EmailSendOptions {
  to: string
  subject: string
  html: string
  text: string
  from: {
    email: string
    name?: string
  }
}

export interface EmailSendResult {
  provider: string
  deliveryId: string | null
}

export interface EmailProvider {
  send(options: EmailSendOptions): Promise<EmailSendResult>
}
