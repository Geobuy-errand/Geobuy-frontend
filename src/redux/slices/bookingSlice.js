import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentBooking: null,
  bookings: [],
  availableJobs: [],
  loading: false,
  error: null,
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload
    },
    setBookings: (state, action) => {
      state.bookings = action.payload
    },
    setAvailableJobs: (state, action) => {
      state.availableJobs = action.payload
    },
    addBooking: (state, action) => {
      state.bookings.unshift(action.payload)
    },
    updateBooking: (state, action) => {
      const index = state.bookings.findIndex(b => b._id === action.payload._id)
      if (index !== -1) {
        state.bookings[index] = action.payload
      }
      if (state.currentBooking?._id === action.payload._id) {
        state.currentBooking = action.payload
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setCurrentBooking,
  setBookings,
  setAvailableJobs,
  addBooking,
  updateBooking,
  setLoading,
  setError,
  clearError,
} = bookingSlice.actions

export default bookingSlice.reducer