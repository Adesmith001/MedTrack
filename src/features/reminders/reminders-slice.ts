import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { demoReminders } from '../../lib/mock-data'
import type { ReminderRecord, ReminderStatus } from '../../types/domain'

interface RemindersState {
  items: ReminderRecord[]
  statusFilter: ReminderStatus | 'all'
}

const initialState: RemindersState = {
  items: demoReminders,
  statusFilter: 'all',
}

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    setReminderFilter(state, action: PayloadAction<ReminderStatus | 'all'>) {
      state.statusFilter = action.payload
    },
  },
})

export const { setReminderFilter } = remindersSlice.actions
export default remindersSlice.reducer
