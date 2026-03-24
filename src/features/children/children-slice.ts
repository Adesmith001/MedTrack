import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { demoChildren } from '../../lib/mock-data'
import type { ChildProfile } from '../../types/domain'

interface ChildrenState {
  items: ChildProfile[]
  searchTerm: string
  selectedChildId: string
}

const initialState: ChildrenState = {
  items: demoChildren,
  searchTerm: '',
  selectedChildId: demoChildren[0]?.id ?? '',
}

const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload
    },
    selectChild(state, action: PayloadAction<string>) {
      state.selectedChildId = action.payload
    },
  },
})

export const { selectChild, setSearchTerm } = childrenSlice.actions
export default childrenSlice.reducer
