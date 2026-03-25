import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthSessionUser, AuthStatus, UserRole } from '../../types/app'
import type { UserProfile } from '../../types/models'
import { getAuthErrorMessage } from './auth-errors'
import {
  loginUser as loginUserRequest,
  logoutUser as logoutUserRequest,
  registerUser as registerUserRequest,
  requestPasswordReset,
  resetPassword as resetPasswordRequest,
} from '../../services/auth-service'

interface AuthState {
  status: AuthStatus
  isInitialized: boolean
  user: AuthSessionUser | null
  profile: UserProfile | null
  error: string | null
  successMessage: string | null
}

const initialState: AuthState = {
  status: 'idle',
  isInitialized: false,
  user: null,
  profile: null,
  error: null,
  successMessage: null,
}

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    {
      fullName,
      email,
      password,
      role,
    }: {
      fullName: string
      email: string
      password: string
      role: UserRole
    },
    { rejectWithValue },
  ) => {
    try {
      return await registerUserRequest({ fullName, email, password, role })
    } catch (error) {
      return rejectWithValue(getAuthErrorMessage(error))
    }
  },
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      await loginUserRequest({ email, password })
    } catch (error) {
      return rejectWithValue(getAuthErrorMessage(error))
    }
  },
)

export const sendPasswordReset = createAsyncThunk(
  'auth/sendPasswordReset',
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      await requestPasswordReset(email)
    } catch (error) {
      return rejectWithValue(getAuthErrorMessage(error))
    }
  },
)

export const confirmPasswordReset = createAsyncThunk(
  'auth/confirmPasswordReset',
  async (
    { code, password }: { code: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      await resetPasswordRequest(code, password)
    } catch (error) {
      return rejectWithValue(getAuthErrorMessage(error))
    }
  },
)

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutUserRequest()
  } catch (error) {
    return rejectWithValue(getAuthErrorMessage(error))
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authSyncStarted(state) {
      state.status = 'loading'
      state.error = null
    },
    authSyncCompleted(
      state,
      action: PayloadAction<{
        user: AuthSessionUser | null
        profile: UserProfile | null
      }>,
    ) {
      state.isInitialized = true
      state.user = action.payload.user
      state.profile = action.payload.profile
      state.status = action.payload.user && action.payload.profile ? 'authenticated' : 'unauthenticated'
    },
    authSyncFailed(state, action: PayloadAction<string>) {
      state.isInitialized = true
      state.status = 'unauthenticated'
      state.user = null
      state.profile = null
      state.error = action.payload
    },
    clearAuthFeedback(state) {
      state.error = null
      state.successMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.successMessage = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.successMessage = `Account created for ${action.payload.fullName}.`
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'unauthenticated'
        state.error = (action.payload as string | undefined) ?? action.error.message ?? 'Registration failed.'
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.successMessage = null
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.successMessage = 'Login successful.'
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'unauthenticated'
        state.error = (action.payload as string | undefined) ?? action.error.message ?? 'Login failed.'
      })
      .addCase(sendPasswordReset.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.successMessage = null
      })
      .addCase(sendPasswordReset.fulfilled, (state) => {
        state.status = state.user && state.profile ? 'authenticated' : 'unauthenticated'
        state.successMessage =
          'Password reset instructions have been sent if the email exists in the system.'
      })
      .addCase(sendPasswordReset.rejected, (state, action) => {
        state.status = state.user && state.profile ? 'authenticated' : 'unauthenticated'
        state.error =
          (action.payload as string | undefined) ?? action.error.message ?? 'Unable to send reset email.'
      })
      .addCase(confirmPasswordReset.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.successMessage = null
      })
      .addCase(confirmPasswordReset.fulfilled, (state) => {
        state.status = state.user && state.profile ? 'authenticated' : 'unauthenticated'
        state.successMessage = 'Your password has been updated successfully.'
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.status = state.user && state.profile ? 'authenticated' : 'unauthenticated'
        state.error =
          (action.payload as string | undefined) ?? action.error.message ?? 'Unable to reset password.'
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.successMessage = null
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.successMessage = 'You have been signed out.'
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = state.user && state.profile ? 'authenticated' : 'unauthenticated'
        state.error = (action.payload as string | undefined) ?? action.error.message ?? 'Logout failed.'
      })
  },
})

export const { authSyncCompleted, authSyncFailed, authSyncStarted, clearAuthFeedback } =
  authSlice.actions
export default authSlice.reducer
