import { firestoreCollections } from '../lib/firestore/collections'
import type { Notification } from '../types/models'
import { createCollectionService } from './create-collection-service'

const baseService = createCollectionService<Notification>(firestoreCollections.notifications)

export const notificationsService = {
  ...baseService,
  listByUser(userId: string) {
    return baseService.list({
      filters: [{ field: 'userId', operator: '==', value: userId }],
      sort: [{ field: 'createdAt', direction: 'desc' }],
    })
  },
  listUnread(userId: string) {
    return baseService.list({
      filters: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'isRead', operator: '==', value: false },
      ],
      sort: [{ field: 'createdAt', direction: 'desc' }],
    })
  },
}
