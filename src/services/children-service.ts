import { firestoreCollections } from '../lib/firestore/collections'
import type { Child } from '../types/models'
import { createCollectionService } from './create-collection-service'

const baseService = createCollectionService<Child>(firestoreCollections.children)

export const childrenService = {
  ...baseService,
  listByHospital(hospitalId: string) {
    return baseService.list({
      filters: [{ field: 'hospitalId', operator: '==', value: hospitalId }],
      sort: [{ field: 'fullName', direction: 'asc' }],
    })
  },
  listByParentEmail(parentEmail: string) {
    return baseService.list({
      filters: [{ field: 'parentEmail', operator: '==', value: parentEmail }],
      sort: [{ field: 'fullName', direction: 'asc' }],
    })
  },
}
