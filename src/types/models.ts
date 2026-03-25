import type { UserRole } from './app'
import type { BaseDocument } from './firestore'

export type ChildGender = 'male' | 'female' | 'other'

export type ImmunizationScheduleStatus = 'upcoming' | 'due' | 'completed' | 'overdue'

export type ReminderChannel = 'email' | 'sms'

export type ReminderTriggerType =
  | 'manual'
  | '7-days-before'
  | '3-days-before'
  | '1-day-before'
  | 'on-due-date'

export type ReminderStatus = 'pending' | 'sent' | 'failed' | 'cancelled'

export type NotificationType = 'system' | 'reminder' | 'record-update'

export type NotificationChannel = 'in-app' | 'email' | 'sms'

export interface UserProfile extends BaseDocument {
  uid: string
  fullName: string
  email: string
  role: UserRole
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
  parentEmail: string
  vaccineName: string
  recommendedAge: string
  dueDate: string
  status: ImmunizationScheduleStatus
  notes: string
}

export interface ImmunizationRecord extends BaseDocument {
  childId: string
  parentEmail: string
  scheduleId: string
  vaccineName: string
  dateAdministered: string
  staffId: string
  notes: string
}

export interface Reminder extends BaseDocument {
  childId: string
  parentEmail: string
  scheduleId: string
  channel: ReminderChannel
  triggerType: ReminderTriggerType
  status: ReminderStatus
  recipient: string
  message: string
  sentAt: string | null
  lastAttemptAt: string | null
  failureReason: string | null
  deliveryProvider: string | null
  deliveryId: string | null
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
