import { firestoreCollections } from '../lib/firestore/collections'
import type { ImmunizationSchedule } from '../types/models'
import { createCollectionService } from './create-collection-service'

const baseService = createCollectionService<ImmunizationSchedule>(
  firestoreCollections.immunizationSchedules,
)

export const immunizationSchedulesService = {
  ...baseService,
  listByChild(childId: string) {
    return baseService.list({
      filters: [{ field: 'childId', operator: '==', value: childId }],
      sort: [{ field: 'dueDate', direction: 'asc' }],
    })
  },
  listByStatus(status: ImmunizationSchedule['status']) {
    return baseService.list({
      filters: [{ field: 'status', operator: '==', value: status }],
      sort: [{ field: 'dueDate', direction: 'asc' }],
    })
  },
}
