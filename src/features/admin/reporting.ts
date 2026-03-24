import { buildChildSchedule } from '../immunizations/schedule'
import type { ChildProfile, ReminderRecord } from '../../types/domain'

export interface FacilityReport {
  facilityName: string
  childCount: number
  completedDoses: number
  pendingAttention: number
}

export interface DeliverySummary {
  channel: 'email' | 'sms'
  sent: number
  failed: number
  queued: number
  successRate: string
}

export function buildFacilityReports(children: ChildProfile[]): FacilityReport[] {
  const facilities = [...new Set(children.map((child) => child.facilityName))]

  return facilities.map((facilityName) => {
    const facilityChildren = children.filter((child) => child.facilityName === facilityName)
    const schedules = facilityChildren.flatMap((child) => buildChildSchedule(child))

    return {
      facilityName,
      childCount: facilityChildren.length,
      completedDoses: schedules.filter((item) => item.status === 'completed').length,
      pendingAttention: schedules.filter(
        (item) => item.status === 'due' || item.status === 'overdue',
      ).length,
    }
  })
}

export function buildDeliverySummary(reminders: ReminderRecord[]): DeliverySummary[] {
  return (['email', 'sms'] as const).map((channel) => {
    const channelReminders = reminders.filter((item) => item.channel === channel)
    const sent = channelReminders.filter((item) => item.status === 'sent').length
    const failed = channelReminders.filter((item) => item.status === 'failed').length
    const queued = channelReminders.filter((item) => item.status === 'queued').length
    const attempted = sent + failed
    const successRate = attempted === 0 ? '0%' : `${Math.round((sent / attempted) * 100)}%`

    return {
      channel,
      sent,
      failed,
      queued,
      successRate,
    }
  })
}
