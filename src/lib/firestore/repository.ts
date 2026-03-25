import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as limitConstraint,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { firestore } from '../firebase'
import type {
  BaseDocument,
  CreateDocumentInput,
  FirestoreQueryOptions,
  FirestoreWritePayload,
  UpdateDocumentInput,
} from '../../types/firestore'
import type { FirestoreCollectionName } from './collections'

function ensureFirestore() {
  if (!firestore) {
    throw new Error(
      'Firestore is not initialized. Set the required VITE_FIREBASE_* variables before using the data layer.',
    )
  }

  return firestore
}

function mapSnapshot<TDocument extends BaseDocument>(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): TDocument {
  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<TDocument, 'id'>),
  } as TDocument
}

function buildQueryConstraints<TDocument>(
  options?: FirestoreQueryOptions<TDocument>,
): QueryConstraint[] {
  if (!options) {
    return []
  }

  const constraints: QueryConstraint[] = []

  options.filters?.forEach((filter) => {
    constraints.push(where(filter.field, filter.operator, filter.value))
  })

  options.sort?.forEach((sortRule) => {
    constraints.push(orderBy(sortRule.field, sortRule.direction))
  })

  if (typeof options.limit === 'number') {
    constraints.push(limitConstraint(options.limit))
  }

  return constraints
}

export async function createDocument<TDocument extends BaseDocument>(
  collectionName: FirestoreCollectionName,
  data: CreateDocumentInput<TDocument>,
): Promise<string> {
  const db = ensureFirestore()
  const collectionRef = collection(db, collectionName)
  const payload: FirestoreWritePayload<TDocument> = {
    ...(data as FirestoreWritePayload<TDocument>),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const snapshot = await addDoc(collectionRef, payload)
  return snapshot.id
}

export async function getDocumentById<TDocument extends BaseDocument>(
  collectionName: FirestoreCollectionName,
  id: string,
): Promise<TDocument | null> {
  const db = ensureFirestore()
  const documentRef = doc(db, collectionName, id)
  const snapshot = await getDoc(documentRef)

  if (!snapshot.exists()) {
    return null
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<TDocument, 'id'>),
  } as TDocument
}

export async function listDocuments<TDocument extends BaseDocument>(
  collectionName: FirestoreCollectionName,
  options?: FirestoreQueryOptions<TDocument>,
): Promise<TDocument[]> {
  const db = ensureFirestore()
  const collectionRef = collection(db, collectionName)
  const snapshot = await getDocs(query(collectionRef, ...buildQueryConstraints(options)))
  return snapshot.docs.map((item) => mapSnapshot<TDocument>(item))
}

export async function updateDocument<TDocument extends BaseDocument>(
  collectionName: FirestoreCollectionName,
  id: string,
  data: UpdateDocumentInput<TDocument>,
): Promise<void> {
  const db = ensureFirestore()
  const documentRef = doc(db, collectionName, id)
  const payload: FirestoreWritePayload<TDocument> = {
    ...(data as FirestoreWritePayload<TDocument>),
    updatedAt: serverTimestamp(),
  }
  await updateDoc(documentRef, payload)
}

export async function deleteDocument(
  collectionName: FirestoreCollectionName,
  id: string,
): Promise<void> {
  const db = ensureFirestore()
  const documentRef = doc(db, collectionName, id)
  await deleteDoc(documentRef)
}
