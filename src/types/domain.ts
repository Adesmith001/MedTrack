export type UserRole = 'parent' | 'staff' | 'admin'

export type ChildSex = 'male' | 'female'

export type ScheduleStatus = 'completed' | 'due' | 'upcoming' | 'overdue'

export type ReminderChannel = 'email' | 'sms'

export type ReminderStatus = 'queued' | 'sent' | 'failed'

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  facilityName: string
}

export interface VaccineAdministration {
  id: string
  vaccineCode: string
  vaccineName: string
  doseLabel: string
  scheduledDate: string
  completedDate?: string
  administeredBy?: string
  facilityName: string
  notes?: string
}

export interface ChildProfile {
  id: string
  parentId: string
  fullName: string
  birthDate: string
  sex: ChildSex
  guardianName: string
  phone: string
  address: string
  facilityId: string
  facilityName: string
  nextAppointment: string
  lastUpdated: string
  immunizations: VaccineAdministration[]
}

export interface ReminderRecord {
  id: string
  childId: string
  childName: string
  guardianName: string
  target: string
  channel: ReminderChannel
  status: ReminderStatus
  scheduledFor: string
  sentAt?: string
  message: string
}

export interface VaccineScheduleTemplate {
  vaccineCode: string
  vaccineName: string
  doseLabel: string
  ageLabel: string
  description: string
  offsetDays: number
  recommendedWindowDays: number
}

export interface ScheduleItem extends VaccineScheduleTemplate {
  dueDate: string
  status: ScheduleStatus
  completedDate?: string
  administeredBy?: string
  isCritical: boolean
}
