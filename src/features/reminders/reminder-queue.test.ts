import {
  buildPendingReminderPayloads,
  buildReminderMessage,
  createReminderDocumentId,
  createReminderQueueKey,
} from './reminder-queue'
import type { Child, ImmunizationSchedule, Reminder } from '../../types/models'

const child: Child = {
  id: 'child_1',
  fullName: 'Amina Bello',
  dateOfBirth: '2025-01-01',
  gender: 'female',
  parentName: 'Musa Bello',
  parentEmail: 'Parent@Example.com',
  parentPhone: '+2348012345678',
  address: '12 Clinic Street',
  hospitalId: 'HSP-001',
  notes: '',
  createdBy: 'staff_1',
  createdAt: null,
  updatedAt: null,
}

const schedule: ImmunizationSchedule = {
  id: 'schedule_1',
  childId: 'child_1',
  vaccineName: 'Penta 1',
  recommendedAge: '6 weeks',
  dueDate: '2025-01-08',
  status: 'upcoming',
  notes: '',
  createdAt: null,
  updatedAt: null,
}

describe('reminder-queue', () => {
  it('creates deterministic queue keys and document ids', () => {
    expect(createReminderQueueKey('schedule_1', '7-days-before', 'email')).toBe(
      'schedule_1__7-days-before__email',
    )
    expect(createReminderDocumentId('schedule_1', '7-days-before', 'email')).toBe(
      'queue_schedule_1__7-days-before__email',
    )
  })

  it('formats reminder messages for queue generation', () => {
    expect(buildReminderMessage(child, schedule, 'email', '7 days before due date')).toContain(
      'Amina Bello is scheduled for Penta 1',
    )
  })

  it('creates pending email and sms reminders for eligible schedules', () => {
    const result = buildPendingReminderPayloads([child], [schedule], [], '2025-01-01')

    expect(result.eligibleCount).toBe(2)
    expect(result.duplicateCount).toBe(0)
    expect(result.payloads).toHaveLength(2)
    expect(result.payloads.map((item) => item.data.channel).sort()).toEqual(['email', 'sms'])
    expect(result.payloads[0]?.data.status).toBe('pending')
  })

  it('prevents duplicate reminders for the same schedule, trigger, and channel', () => {
    const existingReminder: Reminder = {
      id: 'queue_schedule_1__7-days-before__email',
      childId: 'child_1',
      scheduleId: 'schedule_1',
      channel: 'email',
      triggerType: '7-days-before',
      status: 'pending',
      recipient: 'parent@example.com',
      message: 'Existing reminder',
      sentAt: null,
      lastAttemptAt: null,
      failureReason: null,
      deliveryProvider: null,
      deliveryId: null,
      createdAt: null,
      updatedAt: null,
    }

    const result = buildPendingReminderPayloads([child], [schedule], [existingReminder], '2025-01-01')

    expect(result.eligibleCount).toBe(2)
    expect(result.duplicateCount).toBe(1)
    expect(result.payloads).toHaveLength(1)
    expect(result.payloads[0]?.data.channel).toBe('sms')
  })
})
