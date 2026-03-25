import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createEntityState, upsertEntity, type EntityState } from '../entity-state'
import { usersService } from '../../services/users-service'
import type { UserProfile } from '../../types/models'
import type {
  CreateDocumentInput,
  FirestoreQueryOptions,
  UpdateDocumentInput,
} from '../../types/firestore'

type UsersState = EntityState<UserProfile>

const initialState: UsersState = createEntityState<UserProfile>()

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (options?: FirestoreQueryOptions<UserProfile>) => usersService.list(options),
)

export const fetchUserById = createAsyncThunk('users/fetchById', async (id: string) => {
  const user = await usersService.getById(id)

  if (!user) {
    throw new Error(`User with id "${id}" was not found.`)
  }

  return user
})

export const createUser = createAsyncThunk(
  'users/create',
  async (payload: CreateDocumentInput<UserProfile>) => {
    const id = await usersService.create(payload)
    const user = await usersService.getById(id)

    if (!user) {
      throw new Error('Unable to load created user profile.')
    }

    return user
  },
)

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, data }: { id: string; data: UpdateDocumentInput<UserProfile> }) => {
    await usersService.update(id, data)
    const user = await usersService.getById(id)

    if (!user) {
      throw new Error(`Updated user with id "${id}" was not found.`)
    }

    return user
  },
)

export const deleteUser = createAsyncThunk('users/delete', async (id: string) => {
  await usersService.remove(id)
  return id
})

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch users.'
      })
      .addCase(fetchUserById.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.current = action.payload
        state.items = upsertEntity(state.items, action.payload)
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch user.'
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.items = upsertEntity(state.items, action.payload)
        state.current = action.payload
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.items = upsertEntity(state.items, action.payload)
        state.current = action.payload
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.current = state.current?.id === action.payload ? null : state.current
      })
  },
})

export default usersSlice.reducer
