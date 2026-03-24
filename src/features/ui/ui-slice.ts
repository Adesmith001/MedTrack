import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AppModal } from '../../types/app'

interface UiState {
  isSidebarOpen: boolean
  activeModal: AppModal
  isPageLoading: boolean
}

const initialState: UiState = {
  isSidebarOpen: false,
  activeModal: null,
  isPageLoading: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isSidebarOpen = action.payload
    },
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen
    },
    openModal(state, action: PayloadAction<NonNullable<AppModal>>) {
      state.activeModal = action.payload
    },
    closeModal(state) {
      state.activeModal = null
    },
    setPageLoading(state, action: PayloadAction<boolean>) {
      state.isPageLoading = action.payload
    },
  },
})

export const { closeModal, openModal, setPageLoading, setSidebarOpen, toggleSidebar } =
  uiSlice.actions
export default uiSlice.reducer
