export interface SmsSendOptions {
  to: string
  message: string
  from?: string
}

export interface SmsSendResult {
  provider: string
  deliveryId: string | null
}

export interface SmsProvider {
  send(options: SmsSendOptions): Promise<SmsSendResult>
}
