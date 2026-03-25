import type { EmailProvider } from './providers/email-provider'
import { ConsoleEmailProvider } from './providers/console-email-provider'
import { ResendEmailProvider } from './providers/resend-email-provider'

export interface EmailRuntimeConfig {
  provider: 'resend' | 'console'
  fromAddress: string
  fromName: string
  clinicName: string
}

export function getEmailRuntimeConfig(): EmailRuntimeConfig {
  const provider = (process.env.EMAIL_PROVIDER ?? 'resend').toLowerCase()

  if (provider !== 'resend' && provider !== 'console') {
    throw new Error(`Unsupported EMAIL_PROVIDER "${provider}".`)
  }

  return {
    provider,
    fromAddress: process.env.EMAIL_FROM_ADDRESS ?? 'noreply@example.com',
    fromName: process.env.EMAIL_FROM_NAME ?? 'MedTrack',
    clinicName: process.env.MEDTRACK_CLINIC_NAME ?? 'MedTrack Immunization Clinic',
  }
}

export function createEmailProvider(config: EmailRuntimeConfig): EmailProvider {
  if (config.provider === 'console') {
    return new ConsoleEmailProvider()
  }

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY for the configured email provider.')
  }

  return new ResendEmailProvider(apiKey)
}
