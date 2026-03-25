import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { firebaseSetupMessage, hasFirebaseConfig } from '../../lib/firebase'

interface AppConfigState {
  appName: string
  environment: string
  firebaseReady: boolean
  setupMessage: string
}

const initialState: AppConfigState = {
  appName: 'MedTrack',
  environment: import.meta.env.MODE,
  firebaseReady: hasFirebaseConfig,
  setupMessage: firebaseSetupMessage,
}

const appConfigSlice = createSlice({
  name: 'appConfig',
  initialState,
  reducers: {
    setFirebaseReady(state, action: PayloadAction<boolean>) {
      state.firebaseReady = action.payload
    },
  },
})

export const { setFirebaseReady } = appConfigSlice.actions
export default appConfigSlice.reducer
