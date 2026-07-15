import { baseApi } from './api'

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserReviews: builder.query({
      query: (userId) => `/reviews/user/${userId}`,
      providesTags: ['Review'],
    }),
    getBookingReviews: builder.query({
      query: (bookingId) => `/reviews/booking/${bookingId}`,
      providesTags: ['Review'],
    }),
    createReview: builder.mutation({
      query: (data) => ({
        url: '/reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Review', 'User'],
    }),
    respondToReview: builder.mutation({
      query: ({ id, response }) => ({
        url: `/reviews/${id}/respond`,
        method: 'PUT',
        body: { response },
      }),
      invalidatesTags: ['Review'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetUserReviewsQuery,
  useGetBookingReviewsQuery,
  useCreateReviewMutation,
  useRespondToReviewMutation,
} = reviewApi