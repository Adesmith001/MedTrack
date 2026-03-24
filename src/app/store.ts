import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/auth-slice'
import childrenReducer from '../features/children/children-slice'
import remindersReducer from '../features/reminders/reminders-slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    children: childrenReducer,
    reminders: remindersReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
