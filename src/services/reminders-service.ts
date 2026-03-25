import { firestoreCollections } from '../lib/firestore/collections'
import type { Reminder } from '../types/models'
import { createCollectionService } from './create-collection-service'

const baseService = createCollectionService<Reminder>(firestoreCollections.reminders)

export const remindersService = {
  ...baseService,
  listByChild(childId: string) {
    return baseService.list({
      filters: [{ field: 'childId', operator: '==', value: childId }],
      sort: [{ field: 'createdAt', direction: 'desc' }],
    })
  },
  listByStatus(status: Reminder['status']) {
    return baseService.list({
      filters: [{ field: 'status', operator: '==', value: status }],
      sort: [{ field: 'createdAt', direction: 'desc' }],
    })
  },
}
