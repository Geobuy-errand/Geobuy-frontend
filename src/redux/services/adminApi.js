import { baseApi } from './api'

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/admin/dashboard/stats',
      providesTags: ['Admin'],
    }),
    getUsers: builder.query({
      query: (params) => `/admin/users?${new URLSearchParams(params)}`,
      providesTags: ['Admin'],
    }),
    getVerificationQueue: builder.query({
      query: () => '/admin/verification-queue',
      providesTags: ['Admin'],
    }),
    verifyProvider: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/verify-provider/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Admin', 'User', 'Provider'],
    }),
    toggleUserStatus: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}/toggle-status`,
        method: 'PUT',
      }),
      invalidatesTags: ['Admin', 'User'],
    }),
    getAllBookings: builder.query({
      query: (params) => `/admin/bookings?${new URLSearchParams(params)}`,
      providesTags: ['Admin'],
    }),
    getAllPayments: builder.query({
      query: () => '/admin/payments',
      providesTags: ['Admin'],
    }),
    refundPayment: builder.mutation({
      query: ({ paymentId, reason }) => ({
        url: '/payments/refund',
        method: 'POST',
        body: { paymentId, reason },
      }),
      invalidatesTags: ['Admin', 'Payment'],
    }),
    getAllReviews: builder.query({
      query: () => '/admin/reviews',
      providesTags: ['Admin'],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/admin/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin', 'Review'],
    }),
    getRevenueAnalytics: builder.query({
      query: (period) => `/admin/analytics/revenue?period=${period}`,
      providesTags: ['Admin'],
    }),
    getBookingAnalytics: builder.query({
      query: () => '/admin/analytics/bookings',
      providesTags: ['Admin'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetDashboardStatsQuery,
  useGetUsersQuery,
  useGetVerificationQueueQuery,
  useVerifyProviderMutation,
  useToggleUserStatusMutation,
  useGetAllBookingsQuery,
  useGetAllPaymentsQuery,
  useRefundPaymentMutation,
  useGetAllReviewsQuery,
  useDeleteReviewMutation,
  useGetRevenueAnalyticsQuery,
  useGetBookingAnalyticsQuery,
} = adminApi