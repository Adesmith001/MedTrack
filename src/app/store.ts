import { configureStore } from '@reduxjs/toolkit'
import appConfigReducer from '../features/app-config/app-config-slice'
import authReducer from '../features/auth/auth-slice'
import uiReducer from '../features/ui/ui-slice'

export const store = configureStore({
  reducer: {
    appConfig: appConfigReducer,
    auth: authReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
