import { firestoreCollections } from '../lib/firestore/collections'
import type { UserProfile } from '../types/models'
import { createCollectionService } from './create-collection-service'

const baseService = createCollectionService<UserProfile>(firestoreCollections.users)

export const usersService = {
  ...baseService,
  createProfile(uid: string, data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) {
    return baseService.set(uid, data)
  },
  getByUid(uid: string) {
    return baseService.getById(uid)
  },
  listByRole(role: UserProfile['role']) {
    return baseService.list({
      filters: [{ field: 'role', operator: '==', value: role }],
      sort: [{ field: 'fullName', direction: 'asc' }],
    })
  },
}
