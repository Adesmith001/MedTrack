import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createEntityState, upsertEntity, type EntityState } from '../entity-state'
import { remindersService } from '../../services/reminders-service'
import type { Reminder } from '../../types/models'
import type {
  CreateDocumentInput,
  FirestoreQueryOptions,
  UpdateDocumentInput,
} from '../../types/firestore'
import {
  reminderQueueService,
  type GenerateReminderQueueOptions,
  type GenerateReminderQueueResult,
} from '../../services/reminder-queue-service'
import {
  reminderEmailService,
  type SendEmailRemindersRequest,
  type SendEmailRemindersResponse,
} from '../../services/reminder-email-service'

type RemindersState = EntityState<Reminder>

const initialState: RemindersState = createEntityState<Reminder>()

export const fetchReminders = createAsyncThunk(
  'reminders/fetchAll',
  async (options?: FirestoreQueryOptions<Reminder>) => remindersService.list(options),
)

export const fetchReminderById = createAsyncThunk('reminders/fetchById', async (id: string) => {
  const reminder = await remindersService.getById(id)

  if (!reminder) {
    throw new Error(`Reminder with id "${id}" was not found.`)
  }

  return reminder
})

export const createReminder = createAsyncThunk(
  'reminders/create',
  async (payload: CreateDocumentInput<Reminder>) => {
    const id = await remindersService.create(payload)
    const reminder = await remindersService.getById(id)

    if (!reminder) {
      throw new Error('Unable to load created reminder document.')
    }

    return reminder
  },
)

export const updateReminder = createAsyncThunk(
  'reminders/update',
  async ({ id, data }: { id: string; data: UpdateDocumentInput<Reminder> }) => {
    await remindersService.update(id, data)
    const reminder = await remindersService.getById(id)

    if (!reminder) {
      throw new Error(`Updated reminder with id "${id}" was not found.`)
    }

    return reminder
  },
)

export const deleteReminder = createAsyncThunk('reminders/delete', async (id: string) => {
  await remindersService.remove(id)
  return id
})

export const generateReminderQueue = createAsyncThunk(
  'reminders/generateQueue',
  async (options?: GenerateReminderQueueOptions): Promise<GenerateReminderQueueResult> =>
    reminderQueueService.generatePending(options),
)

export const sendReminderEmails = createAsyncThunk(
  'reminders/sendEmails',
  async (
    payload?: SendEmailRemindersRequest,
  ): Promise<{ summary: SendEmailRemindersResponse; reminders: Reminder[] }> => {
    const summary = await reminderEmailService.sendNow(payload)
    const refreshedReminders = (
      await Promise.all(summary.results.map((result) => remindersService.getById(result.reminderId)))
    ).filter((reminder): reminder is Reminder => reminder !== null)

    return {
      summary,
      reminders: refreshedReminders,
    }
  },
)

const remindersSlice = createSlice({
  name: 'remindersData',
  initialState,
  reducers: {
    clearRemindersFeedback(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReminders.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch reminders.'
      })
      .addCase(fetchReminderById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.current = action.payload
        state.items = upsertEntity(state.items, action.payload)
      })
      .addCase(fetchReminderById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch reminder.'
      })
      .addCase(createReminder.fulfilled, (state, action) => {
        state.items = upsertEntity(state.items, action.payload)
        state.current = action.payload
      })
      .addCase(updateReminder.fulfilled, (state, action) => {
        state.items = upsertEntity(state.items, action.payload)
        state.current = action.payload
      })
      .addCase(deleteReminder.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.current = state.current?.id === action.payload ? null : state.current
      })
      .addCase(generateReminderQueue.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(generateReminderQueue.fulfilled, (state, action) => {
        state.status = 'succeeded'
        action.payload.created.forEach((reminder) => {
          state.items = upsertEntity(state.items, reminder)
        })
      })
      .addCase(generateReminderQueue.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to generate reminder queue.'
      })
      .addCase(sendReminderEmails.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(sendReminderEmails.fulfilled, (state, action) => {
        state.status = 'succeeded'
        action.payload.reminders.forEach((reminder) => {
          state.items = upsertEntity(state.items, reminder)
        })
      })
      .addCase(sendReminderEmails.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to send email reminders.'
      })
  },
})

export const { clearRemindersFeedback } = remindersSlice.actions
export default remindersSlice.reducer
