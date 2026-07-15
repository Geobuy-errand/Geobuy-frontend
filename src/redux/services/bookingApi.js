import { baseApi } from './api'

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query({
      query: () => '/bookings',
      providesTags: ['Booking'],
    }),
    getBookingById: builder.query({
      query: (id) => `/bookings/${id}`,
      providesTags: ['Booking'],
    }),
    getAvailableJobs: builder.query({
      query: () => '/bookings/available',
      providesTags: ['Booking'],
    }),
    getBookingsByStatus: builder.query({
      query: (status) => `/bookings/status/${status}`,
      providesTags: ['Booking'],
    }),
    createBooking: builder.mutation({
      query: (data) => ({
        url: '/bookings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Booking'],
    }),
    acceptBooking: builder.mutation({
      query: (id) => ({
        url: `/bookings/${id}/accept`,
        method: 'PUT',
      }),
      invalidatesTags: ['Booking'],
    }),
    updateBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/bookings/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useGetAvailableJobsQuery,
  useGetBookingsByStatusQuery,
  useCreateBookingMutation,
  useAcceptBookingMutation,
  useUpdateBookingStatusMutation,
} = bookingApi