import type { UserRole } from './app'
import type { BaseDocument } from './firestore'

export type ChildGender = 'male' | 'female' | 'other'

export type ImmunizationScheduleStatus = 'upcoming' | 'due' | 'completed' | 'overdue'

export type ReminderChannel = 'email' | 'sms'

export type ReminderTriggerType =
  | 'manual'
  | 'scheduled'
  | 'due-soon'
  | 'overdue-follow-up'

export type ReminderStatus = 'pending' | 'sent' | 'failed' | 'cancelled'

export type NotificationType = 'system' | 'reminder' | 'record-update'

export type NotificationChannel = 'in-app' | 'email' | 'sms'

export interface UserProfile extends BaseDocument {
  fullName: string
  email: string
  phone: string
  role: UserRole
  hospitalId: string
  isActive: boolean
}

export interface Child extends BaseDocument {
  fullName: string
  dateOfBirth: string
  gender: ChildGender
  parentName: string
  parentEmail: string
  parentPhone: string
  address: string
  hospitalId: string
  notes: string
  createdBy: string
}

export interface ImmunizationSchedule extends BaseDocument {
  childId: string
  vaccineName: string
  recommendedAge: string
  dueDate: string
  status: ImmunizationScheduleStatus
  notes: string
}

export interface ImmunizationRecord extends BaseDocument {
  childId: string
  scheduleId: string
  vaccineName: string
  dateAdministered: string
  staffId: string
  notes: string
}

export interface Reminder extends BaseDocument {
  childId: string
  scheduleId: string
  channel: ReminderChannel
  triggerType: ReminderTriggerType
  status: ReminderStatus
  recipient: string
  message: string
  sentAt: string | null
}

export interface Notification extends BaseDocument {
  userId: string
  type: NotificationType
  channel: NotificationChannel
  title: string
  message: string
  isRead: boolean
  relatedEntityId: string | null
  relatedEntityType: 'child' | 'schedule' | 'record' | 'reminder' | null
  readAt: string | null
}
