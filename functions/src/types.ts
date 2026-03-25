export type UserRole = 'parent' | 'staff' | 'admin'

export type ReminderChannel = 'email' | 'sms'

export type ReminderStatus = 'pending' | 'sent' | 'failed' | 'cancelled'

export interface UserProfileDocument {
  uid: string
  fullName: string
  email: string
  role: UserRole
}

export interface ChildDocument {
  fullName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  parentName: string
  parentEmail: string
  parentPhone: string
  address: string
  hospitalId: string
  notes: string
  createdBy: string
}

export interface ImmunizationScheduleDocument {
  childId: string
  vaccineName: string
  recommendedAge: string
  dueDate: string
  status: 'upcoming' | 'due' | 'completed' | 'overdue'
  notes: string
}

export interface ReminderDocument {
  childId: string
  scheduleId: string
  channel: ReminderChannel
  triggerType: 'manual' | '7-days-before' | '3-days-before' | '1-day-before' | 'on-due-date'
  status: ReminderStatus
  recipient: string
  message: string
  sentAt: string | null
  lastAttemptAt: string | null
  failureReason: string | null
  deliveryProvider: string | null
  deliveryId: string | null
}
