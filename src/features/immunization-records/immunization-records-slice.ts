import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createEntityState, upsertEntity, type EntityState } from '../entity-state'
import { immunizationRecordsService } from '../../services/immunization-records-service'
import { immunizationSchedulesService } from '../../services/immunization-schedules-service'
import type { ImmunizationRecord, ImmunizationSchedule } from '../../types/models'
import type {
  CreateDocumentInput,
  FirestoreQueryOptions,
  UpdateDocumentInput,
} from '../../types/firestore'

type ImmunizationRecordsState = EntityState<ImmunizationRecord>

const initialState: ImmunizationRecordsState = createEntityState<ImmunizationRecord>()

export const fetchImmunizationRecords = createAsyncThunk(
  'immunizationRecords/fetchAll',
  async (options?: FirestoreQueryOptions<ImmunizationRecord>) =>
    immunizationRecordsService.list(options),
)

export const fetchImmunizationRecordById = createAsyncThunk(
  'immunizationRecords/fetchById',
  async (id: string) => {
    const record = await immunizationRecordsService.getById(id)

    if (!record) {
      throw new Error(`Immunization record with id "${id}" was not found.`)
    }

    return record
  },
)

export const createImmunizationRecord = createAsyncThunk(
  'immunizationRecords/create',
  async (payload: CreateDocumentInput<ImmunizationRecord>) => {
    const id = await immunizationRecordsService.create(payload)
    const record = await immunizationRecordsService.getById(id)

    if (!record) {
      throw new Error('Unable to load created immunization record.')
    }

    return record
  },
)

export const completeImmunizationSchedule = createAsyncThunk(
  'immunizationRecords/completeSchedule',
  async ({
    childId,
    parentEmail,
    schedule,
    dateAdministered,
    notes,
    staffId,
  }: {
    childId: string
    parentEmail: string
    schedule: ImmunizationSchedule
    dateAdministered: string
    notes: string
    staffId: string
  }) => {
    const recordId = await immunizationRecordsService.create({
      childId,
      parentEmail,
      scheduleId: schedule.id,
      vaccineName: schedule.vaccineName,
      dateAdministered,
      staffId,
      notes,
    })

    try {
      await immunizationSchedulesService.update(schedule.id, {
        parentEmail,
        status: 'completed',
        notes: schedule.notes,
      })
    } catch (error) {
      await immunizationRecordsService.remove(recordId)
      throw error
    }

    const record =
      (await immunizationRecordsService.getById(recordId)) ?? {
        id: recordId,
        childId,
        parentEmail,
        scheduleId: schedule.id,
        vaccineName: schedule.vaccineName,
        dateAdministered,
        staffId,
        notes,
        createdAt: null,
        updatedAt: null,
      }
    const updatedSchedule = (await immunizationSchedulesService.getById(schedule.id)) ?? {
      ...schedule,
      status: 'completed' as const,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    }

    return {
      record,
      schedule: updatedSchedule,
    }
  },
)

export const updateImmunizationRecord = createAsyncThunk(
  'immunizationRecords/update',
  async ({
    id,
    data,
  }: {
    id: string
    data: UpdateDocumentInput<ImmunizationRecord>
  }) => {
    await immunizationRecordsService.update(id, data)
    const record = await immunizationRecordsService.getById(id)

    if (!record) {
      throw new Error(`Updated immunization record with id "${id}" was not found.`)
    }

    return record
  },
)

export const deleteImmunizationRecord = createAsyncThunk(
  'immunizationRecords/delete',
  async (id: string) => {
    await immunizationRecordsService.remove(id)
    return id
  },
)

const immunizationRecordsSlice = createSlice({
  name: 'immunizationRecords',
  initialState,
  reducers: {
    clearImmunizationRecordsFeedback(state) {
      state.error = null
    },
    clearCurrentImmunizationRecord(state) {
      state.current = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImmunizationRecords.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchImmunizationRecords.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchImmunizationRecords.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch immunization records.'
      })
      .addCase(fetchImmunizationRecordById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.current = action.payload
        state.items = upsertEntity(state.items, action.payload)
      })
      .addCase(fetchImmunizationRecordById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to fetch immunization record.'
      })
      .addCase(createImmunizationRecord.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createImmunizationRecord.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = upsertEntity(state.items, action.payload)
        state.current = action.payload
      })
      .addCase(createImmunizationRecord.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to create immunization record.'
      })
      .addCase(completeImmunizationSchedule.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(completeImmunizationSchedule.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = upsertEntity(state.items, action.payload.record)
        state.current = action.payload.record
      })
      .addCase(completeImmunizationSchedule.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to complete immunization schedule.'
      })
      .addCase(updateImmunizationRecord.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateImmunizationRecord.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = upsertEntity(state.items, action.payload)
        state.current = action.payload
      })
      .addCase(updateImmunizationRecord.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to update immunization record.'
      })
      .addCase(deleteImmunizationRecord.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.current = state.current?.id === action.payload ? null : state.current
      })
  },
})

export const { clearCurrentImmunizationRecord, clearImmunizationRecordsFeedback } =
  immunizationRecordsSlice.actions
export default immunizationRecordsSlice.reducer
