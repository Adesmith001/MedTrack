import { firestoreCollections } from './collections'

export const firestoreStructure = {
  [firestoreCollections.users]: {
    description: 'Application users and role profiles for parent, staff, and admin accounts.',
    primaryFields: ['uid', 'role', 'email'],
  },
  [firestoreCollections.children]: {
    description: 'Registered child profiles linked to guardian contact details and a hospital.',
    primaryFields: ['hospitalId', 'parentEmail', 'createdBy'],
  },
  [firestoreCollections.immunizationSchedules]: {
    description: 'Planned vaccine schedule entries for each child, including due dates and status.',
    primaryFields: ['childId', 'parentEmail', 'status', 'dueDate'],
  },
  [firestoreCollections.immunizationRecords]: {
    description: 'Completed vaccine administration records tied to children and schedule items.',
    primaryFields: ['childId', 'parentEmail', 'scheduleId', 'staffId'],
  },
  [firestoreCollections.reminders]: {
    description: 'Reminder jobs and delivery tracking for email and SMS notifications.',
    primaryFields: ['childId', 'parentEmail', 'scheduleId', 'triggerType', 'channel', 'status'],
  },
  [firestoreCollections.notifications]: {
    description: 'In-app and outbound notification records for operational updates.',
    primaryFields: ['userId', 'isRead', 'type'],
  },
} as const
