import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createEntityState, upsertEntity, type EntityState } from '../entity-state'
import { immunizationSchedulesService } from '../../services/immunization-schedules-service'
import type { ImmunizationSchedule } from '../../types/models'
import type {
  CreateDocumentInput,
  FirestoreQueryOptions,
  UpdateDocumentInput,
} from '../../types/firestore'
import { completeImmunizationSchedule } from '../immunization-records/immunization-records-slice'
import { generateScheduleEntriesForChild, hydrateScheduleStatuses } from './schedule-engine'
import { vaccineDefinitions } from './vaccine-definitions'

type ImmunizationSchedulesState = EntityState<ImmunizationSchedule>

const initialState: ImmunizationSchedulesState = createEntityState<ImmunizationSchedule>()

export const fetchImmunizationSchedules = createAsyncThunk(
  'immunizationSchedules/fetchAll',
  async (options?: FirestoreQueryOptions<ImmunizationSchedule>) =>
    hydrateScheduleStatuses(await immunizationSchedulesService.list(options)).sort((left, right) =>
      left.dueDate.localeCompare(right.dueDate),
    ),
)

export const fetchImmunizationScheduleById = createAsyncThunk(
  'immunizationSchedules/fetchById',
  async (id: string) => {
    const schedule = await immunizationSchedulesService.getById(id)

    if (!schedule) {
      throw new Error(`Immunization schedule with id "${id}" was not found.`)
    }

    return hydrateScheduleStatuses([schedule])[0]
  },
)

export const createImmunizationSchedule = createAsyncThunk(
  'immunizationSchedules/create',
  async (payload: CreateDocumentInput<ImmunizationSchedule>) => {
    const id = await immunizationSchedulesService.create(payload)
    const schedule = await immunizationSchedulesService.getById(id)

    if (!schedule) {
      throw new Error('Unable to load created immunization schedule.')
    }

    return hydrateScheduleStatuses([schedule])[0]
  },
)

export const generateSchedulesForChild = createAsyncThunk(
  'immunizationSchedules/generateForChild',
  async ({
    childId,
    dateOfBirth,
    parentEmail,
  }: {
    childId: string
    dateOfBirth: string
    parentEmail: string
  }) => {
    const entries = generateScheduleEntriesForChild(
      { id: childId, dateOfBirth, parentEmail },
      vaccineDefinitions,
    )

    await immunizationSchedulesService.createBatch(entries)
    const schedules = await immunizationSchedulesService.listByChild(childId)

    return hydrateScheduleStatuses(schedules).sort((left, right) =>
      left.dueDate.localeCompare(right.dueDate),
    )
  },
)

export const updateImmunizationSchedule = createAsyncThunk(
  'immunizationSchedules/update',
  async ({
    id,
    data,
  }: {
    id: string
    data: UpdateDocumentInput<ImmunizationSchedule>
  }) => {
    await immunizationSchedulesService.update(id, data)
    const schedule = await immunizationSchedulesService.getById(id)

    if (!schedule) {
      throw new Error(`Updated immunization schedule with id "${id}" was not found.`)
    }

    return hydrateScheduleStatuses([schedule])[0]
  },
)

export const deleteImmunizationSchedule = createAsyncThunk(
  'immunizationSchedules/delete',
  async (id: string) => {
    await immunizationSchedulesService.remove(id)
    return id
  },
)

const immunizationSchedulesSlice = createSlice({
  name: 'immunizationSchedules',
  initialState,
  reducers: {
    clearImmunizationSchedulesFeedback(state) {
      state.error = null
    },
    clearCurrentImmunizationSchedule(state) {
      state.current = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImmunizationSchedules.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.items = []
      })
      .addCase(fetchImmunizationSchedules.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchImmunizationSchedules.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch immunization schedules.'
      })
      .addCase(fetchImmunizationScheduleById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.current = action.payload
        state.items = upsertEntity(state.items, action.payload)
      })
      .addCase(fetchImmunizationScheduleById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch immunization schedule.'
      })
      .addCase(createImmunizationSchedule.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createImmunizationSchedule.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = upsertEntity(state.items, action.payload)
        state.current = action.payload
      })
      .addCase(createImmunizationSchedule.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to create immunization schedule.'
      })
      .addCase(generateSchedulesForChild.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(generateSchedulesForChild.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
        state.current = action.payload[0] ?? null
      })
      .addCase(generateSchedulesForChild.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to generate immunization schedules.'
      })
      .addCase(updateImmunizationSchedule.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateImmunizationSchedule.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = upsertEntity(state.items, action.payload)
        state.current = action.payload
      })
      .addCase(updateImmunizationSchedule.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to update immunization schedule.'
      })
      .addCase(completeImmunizationSchedule.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = upsertEntity(state.items, action.payload.schedule)
        state.current =
          state.current?.id === action.payload.schedule.id ? action.payload.schedule : state.current
      })
      .addCase(completeImmunizationSchedule.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to synchronize schedule completion.'
      })
      .addCase(deleteImmunizationSchedule.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.current = state.current?.id === action.payload ? null : state.current
      })
  },
})

export const { clearCurrentImmunizationSchedule, clearImmunizationSchedulesFeedback } =
  immunizationSchedulesSlice.actions
export default immunizationSchedulesSlice.reducer
