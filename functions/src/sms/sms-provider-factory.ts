import { ConsoleSmsProvider } from './providers/console-sms-provider'
import type { SmsProvider } from './providers/sms-provider'
import { TermiiSmsProvider } from './providers/termii-sms-provider'
import { TwilioSmsProvider } from './providers/twilio-sms-provider'

export interface SmsRuntimeConfig {
  provider: 'termii' | 'twilio' | 'console'
  senderId: string
  clinicName: string
}

export function getSmsRuntimeConfig(): SmsRuntimeConfig {
  const provider = (process.env.SMS_PROVIDER ?? 'console').toLowerCase()

  if (provider !== 'termii' && provider !== 'twilio' && provider !== 'console') {
    throw new Error(`Unsupported SMS_PROVIDER "${provider}".`)
  }

  return {
    provider,
    senderId: process.env.MEDTRACK_SMS_SENDER ?? process.env.TERMII_SENDER_ID ?? process.env.TWILIO_FROM_NUMBER ?? 'MedTrack',
    clinicName: process.env.MEDTRACK_CLINIC_NAME ?? 'MedTrack Immunization Clinic',
  }
}

export function createSmsProvider(config: SmsRuntimeConfig): SmsProvider {
  if (config.provider === 'console') {
    return new ConsoleSmsProvider()
  }

  if (config.provider === 'termii') {
    const apiKey = process.env.TERMII_API_KEY
    const senderId = process.env.TERMII_SENDER_ID ?? config.senderId

    if (!apiKey) {
      throw new Error('Missing TERMII_API_KEY for the configured SMS provider.')
    }

    return new TermiiSmsProvider(apiKey, senderId)
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_FROM_NUMBER ?? config.senderId

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Missing Twilio runtime configuration for the configured SMS provider.')
  }

  return new TwilioSmsProvider(accountSid, authToken, fromNumber)
}
