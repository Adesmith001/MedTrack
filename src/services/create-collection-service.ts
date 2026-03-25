import type { FirestoreCollectionName } from '../lib/firestore/collections'
import {
  createDocument,
  deleteDocument,
  getDocumentById,
  listDocuments,
  setDocument,
  updateDocument,
} from '../lib/firestore/repository'
import type {
  BaseDocument,
  CreateDocumentInput,
  FirestoreQueryOptions,
  UpdateDocumentInput,
} from '../types/firestore'

export function createCollectionService<TDocument extends BaseDocument>(
  collectionName: FirestoreCollectionName,
) {
  return {
    create(data: CreateDocumentInput<TDocument>) {
      return createDocument<TDocument>(collectionName, data)
    },
    set(id: string, data: CreateDocumentInput<TDocument>) {
      return setDocument<TDocument>(collectionName, id, data)
    },
    getById(id: string) {
      return getDocumentById<TDocument>(collectionName, id)
    },
    list(options?: FirestoreQueryOptions<TDocument>) {
      return listDocuments<TDocument>(collectionName, options)
    },
    update(id: string, data: UpdateDocumentInput<TDocument>) {
      return updateDocument<TDocument>(collectionName, id, data)
    },
    remove(id: string) {
      return deleteDocument(collectionName, id)
    },
  }
}
