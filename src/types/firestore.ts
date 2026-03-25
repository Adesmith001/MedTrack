import type { FieldValue, OrderByDirection, Timestamp, WhereFilterOp } from 'firebase/firestore'

export type FirestoreTimestamp = Timestamp | null

export interface TimestampedDocument {
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export interface BaseDocument extends TimestampedDocument {
  id: string
}

export type CreateDocumentInput<TDocument extends BaseDocument> = Omit<
  TDocument,
  'id' | 'createdAt' | 'updatedAt'
>

export type UpdateDocumentInput<TDocument extends BaseDocument> = Partial<
  Omit<TDocument, 'id' | 'createdAt' | 'updatedAt'>
>

export type FirestoreWritePayload<TDocument extends BaseDocument> = Partial<
  Omit<TDocument, 'id'>
> & {
  createdAt?: FieldValue | TDocument['createdAt']
  updatedAt?: FieldValue | TDocument['updatedAt']
}

export interface FirestoreQueryFilter<TDocument> {
  field: Extract<keyof TDocument, string>
  operator: WhereFilterOp
  value: unknown
}

export interface FirestoreQuerySort<TDocument> {
  field: Extract<keyof TDocument, string>
  direction?: OrderByDirection
}

export interface FirestoreQueryOptions<TDocument> {
  filters?: FirestoreQueryFilter<TDocument>[]
  sort?: FirestoreQuerySort<TDocument>[]
  limit?: number
}
