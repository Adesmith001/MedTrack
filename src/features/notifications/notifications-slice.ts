import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createEntityState, upsertEntity, type EntityState } from '../entity-state'
import { notificationsService } from '../../services/notifications-service'
import type { Notification } from '../../types/models'
import type {
  CreateDocumentInput,
  FirestoreQueryOptions,
  UpdateDocumentInput,
} from '../../types/firestore'

type NotificationsState = EntityState<Notification>

const initialState: NotificationsState = createEntityState<Notification>()

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (options?: FirestoreQueryOptions<Notification>) => notificationsService.list(options),
)

export const fetchNotificationById = createAsyncThunk(
  'notifications/fetchById',
  async (id: string) => {
    const notification = await notificationsService.getById(id)

    if (!notification) {
      throw new Error(`Notification with id "${id}" was not found.`)
    }

    return notification
  },
)

export const createNotification = createAsyncThunk(
  'notifications/create',
  async (payload: CreateDocumentInput<Notification>) => {
    const id = await notificationsService.create(payload)
    const notification = await notificationsService.getById(id)

    if (!notification) {
      throw new Error('Unable to load created notification document.')
    }

    return notification
  },
)

export const updateNotification = createAsyncThunk(
  'notifications/update',
  async ({ id, data }: { id: string; data: UpdateDocumentInput<Notification> }) => {
    await notificationsService.update(id, data)
    const notification = await notificationsService.getById(id)

    if (!notification) {
      throw new Error(`Updated notification with id "${id}" was not found.`)
    }

    return notification
  },
)

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id: string) => {
    await notificationsService.remove(id)
    return id
  },
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch notifications.'
      })
      .addCase(fetchNotificationById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.current = action.payload
        state.items = upsertEntity(state.items, action.payload)
      })
      .addCase(fetchNotificationById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch notification.'
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.items = upsertEntity(state.items, action.payload)
        state.current = action.payload
      })
      .addCase(updateNotification.fulfilled, (state, action) => {
        state.items = upsertEntity(state.items, action.payload)
        state.current = action.payload
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.current = state.current?.id === action.payload ? null : state.current
      })
  },
})

export default notificationsSlice.reducer
