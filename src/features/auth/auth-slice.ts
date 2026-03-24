import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { demoUsersByRole } from '../../lib/mock-data'
import type { UserProfile, UserRole } from '../../types/domain'

interface AuthState {
  activeRole: UserRole
  profiles: Record<UserRole, UserProfile>
  sessionMode: 'demo'
}

const initialState: AuthState = {
  activeRole: 'staff',
  profiles: demoUsersByRole,
  sessionMode: 'demo',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setActiveRole(state, action: PayloadAction<UserRole>) {
      state.activeRole = action.payload
    },
  },
})

export const { setActiveRole } = authSlice.actions
export default authSlice.reducer
