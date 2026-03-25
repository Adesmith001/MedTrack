import { firestoreCollections } from '../lib/firestore/collections'
import type { ImmunizationRecord } from '../types/models'
import { createCollectionService } from './create-collection-service'

const baseService = createCollectionService<ImmunizationRecord>(
  firestoreCollections.immunizationRecords,
)

export const immunizationRecordsService = {
  ...baseService,
  listByChild(childId: string) {
    return baseService.list({
      filters: [{ field: 'childId', operator: '==', value: childId }],
      sort: [{ field: 'dateAdministered', direction: 'desc' }],
    })
  },
  listBySchedule(scheduleId: string) {
    return baseService.list({
      filters: [{ field: 'scheduleId', operator: '==', value: scheduleId }],
      sort: [{ field: 'dateAdministered', direction: 'desc' }],
    })
  },
}
