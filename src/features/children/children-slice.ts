import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createEntityState, upsertEntity, type EntityState } from '../entity-state'
import { childrenService } from '../../services/children-service'
import type { Child } from '../../types/models'
import type {
  CreateDocumentInput,
  FirestoreQueryOptions,
  UpdateDocumentInput,
} from '../../types/firestore'

type ChildrenState = EntityState<Child>

const initialState: ChildrenState = createEntityState<Child>()

export const fetchChildren = createAsyncThunk(
  'children/fetchAll',
  async (options?: FirestoreQueryOptions<Child>) => childrenService.list(options),
)

export const fetchChildById = createAsyncThunk('children/fetchById', async (id: string) => {
  const child = await childrenService.getById(id)

  if (!child) {
    throw new Error(`Child with id "${id}" was not found.`)
  }

  return child
})

export const createChild = createAsyncThunk(
  'children/create',
  async (payload: CreateDocumentInput<Child>) => {
    const id = await childrenService.create(payload)
    const child = await childrenService.getById(id)

    if (!child) {
      throw new Error('Unable to load created child document.')
    }

    return child
  },
)

export const updateChild = createAsyncThunk(
  'children/update',
  async ({ id, data }: { id: string; data: UpdateDocumentInput<Child> }) => {
    await childrenService.update(id, data)
    const child = await childrenService.getById(id)

    if (!child) {
      throw new Error(`Updated child with id "${id}" was not found.`)
    }

    return child
  },
)

export const deleteChild = createAsyncThunk('children/delete', async (id: string) => {
  await childrenService.remove(id)
  return id
})

const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChildren.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch children.'
      })
      .addCase(fetchChildById.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchChildById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.current = action.payload
        state.items = upsertEntity(state.items, action.payload)
      })
      .addCase(fetchChildById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch child.'
      })
      .addCase(createChild.fulfilled, (state, action) => {
        state.items = upsertEntity(state.items, action.payload)
        state.current = action.payload
      })
      .addCase(updateChild.fulfilled, (state, action) => {
        state.items = upsertEntity(state.items, action.payload)
        state.current = action.payload
      })
      .addCase(deleteChild.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.current = state.current?.id === action.payload ? null : state.current
      })
  },
})

export default childrenSlice.reducer
