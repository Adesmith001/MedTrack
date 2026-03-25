import { firestoreCollections } from '../lib/firestore/collections'
import type { UserProfile } from '../types/models'
import { createCollectionService } from './create-collection-service'

const baseService = createCollectionService<UserProfile>(firestoreCollections.users)

export const usersService = {
  ...baseService,
  listByHospital(hospitalId: string) {
    return baseService.list({
      filters: [{ field: 'hospitalId', operator: '==', value: hospitalId }],
      sort: [{ field: 'fullName', direction: 'asc' }],
    })
  },
  listByRole(role: UserProfile['role']) {
    return baseService.list({
      filters: [{ field: 'role', operator: '==', value: role }],
      sort: [{ field: 'fullName', direction: 'asc' }],
    })
  },
}
