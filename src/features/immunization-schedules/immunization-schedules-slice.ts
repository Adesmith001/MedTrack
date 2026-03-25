import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createEntityState, upsertEntity, type EntityState } from '../entity-state'
import { immunizationSchedulesService } from '../../services/immunization-schedules-service'
import type { ImmunizationSchedule } from '../../types/models'
import type {
  CreateDocumentInput,
  FirestoreQueryOptions,
  UpdateDocumentInput,
} from '../../types/firestore'

type ImmunizationSchedulesState = EntityState<ImmunizationSchedule>

const initialState: ImmunizationSchedulesState = createEntityState<ImmunizationSchedule>()

export const fetchImmunizationSchedules = createAsyncThunk(
  'immunizationSchedules/fetchAll',
  async (options?: FirestoreQueryOptions<ImmunizationSchedule>) =>
    immunizationSchedulesService.list(options),
)

export const fetchImmunizationScheduleById = createAsyncThunk(
  'immunizationSchedules/fetchById',
  async (id: string) => {
    const schedule = await immunizationSchedulesService.getById(id)

    if (!schedule) {
      throw new Error(`Immunization schedule with id "${id}" was not found.`)
    }

    return schedule
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

    return schedule
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

    return schedule
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchImmunizationSchedules.pending, (state) => {
        state.status = 'loading'
        state.error = null
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
      .addCase(createImmunizationSchedule.fulfilled, (state, action) => {
        state.items = upsertEntity(state.items, action.payload)
        state.current = action.payload
      })
      .addCase(updateImmunizationSchedule.fulfilled, (state, action) => {
        state.items = upsertEntity(state.items, action.payload)
        state.current = action.payload
      })
      .addCase(deleteImmunizationSchedule.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.current = state.current?.id === action.payload ? null : state.current
      })
  },
})

export default immunizationSchedulesSlice.reducer
