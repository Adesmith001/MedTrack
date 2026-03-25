import { firestoreCollections } from '../lib/firestore/collections'
import type { CreateDocumentInput } from '../types/firestore'
import type { ImmunizationSchedule } from '../types/models'
import { createCollectionService } from './create-collection-service'

const baseService = createCollectionService<ImmunizationSchedule>(
  firestoreCollections.immunizationSchedules,
)

export const immunizationSchedulesService = {
  ...baseService,
  async createBatch(schedules: CreateDocumentInput<ImmunizationSchedule>[]) {
    return Promise.all(schedules.map((schedule) => baseService.create(schedule)))
  },
  listByChild(childId: string) {
    return baseService.list({
      filters: [{ field: 'childId', operator: '==', value: childId }],
    })
  },
  listByStatus(status: ImmunizationSchedule['status']) {
    return baseService.list({
      filters: [{ field: 'status', operator: '==', value: status }],
    })
  },
}
