export const firestoreCollections = {
  users: 'users',
  children: 'children',
  immunizationSchedules: 'immunizationSchedules',
  immunizationRecords: 'immunizationRecords',
  reminders: 'reminders',
  notifications: 'notifications',
} as const

export type FirestoreCollectionName =
  (typeof firestoreCollections)[keyof typeof firestoreCollections]
