import { configureStore } from '@reduxjs/toolkit'
import appConfigReducer from '../features/app-config/app-config-slice'
import authReducer from '../features/auth/auth-slice'
import childrenReducer from '../features/children/children-slice'
import immunizationRecordsReducer from '../features/immunization-records/immunization-records-slice'
import immunizationSchedulesReducer from '../features/immunization-schedules/immunization-schedules-slice'
import notificationsReducer from '../features/notifications/notifications-slice'
import remindersReducer from '../features/reminders/reminders-slice'
import uiReducer from '../features/ui/ui-slice'
import usersReducer from '../features/users/users-slice'

export const store = configureStore({
  reducer: {
    appConfig: appConfigReducer,
    auth: authReducer,
    children: childrenReducer,
    immunizationRecords: immunizationRecordsReducer,
    immunizationSchedules: immunizationSchedulesReducer,
    notifications: notificationsReducer,
    reminders: remindersReducer,
    ui: uiReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
