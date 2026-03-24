import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthStatus, UserRole } from '../../types/app'

interface AuthState {
  status: AuthStatus
  currentRole: UserRole | null
}

const initialState: AuthState = {
  status: 'unauthenticated',
  currentRole: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload
    },
    setCurrentRole(state, action: PayloadAction<UserRole | null>) {
      state.currentRole = action.payload
    },
    resetAuthState() {
      return initialState
    },
  },
})

export const { resetAuthState, setAuthStatus, setCurrentRole } = authSlice.actions
export default authSlice.reducer
