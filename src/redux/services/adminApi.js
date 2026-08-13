import { baseApi } from './api';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========== DASHBOARD ==========
    getDashboardStats: builder.query({
      query: () => '/admin/dashboard/stats',
      providesTags: ['Admin'],
    }),

    // ========== USERS ==========
    getUsers: builder.query({
      query: (params) => `/admin/users?${new URLSearchParams(params)}`,
      providesTags: ['Admin'],
    }),
    toggleUserStatus: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}/toggle-status`,
        method: 'PUT',
      }),
      invalidatesTags: ['Admin', 'User'],
    }),

    // ========== PROVIDER VERIFICATION ==========
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

    // ========== BOOKINGS ==========
    getAllBookings: builder.query({
      query: (params) => `/admin/bookings?${new URLSearchParams(params)}`,
      providesTags: ['Admin'],
    }),

    // ========== PAYMENTS ==========
    getAllPayments: builder.query({
      query: () => '/admin/payments',
      providesTags: ['Admin'],
    }),
    
    // ✅ ADD THIS - Payment stats
    getPaymentStats: builder.query({
      query: () => '/payments/admin/stats',
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
    
    releasePayment: builder.mutation({
      query: ({ paymentId }) => ({
        url: '/payments/admin/release-funds',
        method: 'POST',
        body: { paymentId },
      }),
      invalidatesTags: ['Admin', 'Payment'],
    }),

    // ========== REVIEWS ==========
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

    // ========== ANALYTICS ==========
    getRevenueAnalytics: builder.query({
      query: (period) => `/admin/analytics/revenue?period=${period}`,
      providesTags: ['Admin'],
    }),
    getBookingAnalytics: builder.query({
      query: () => '/admin/analytics/bookings',
      providesTags: ['Admin'],
    }),

    // ========== ERRAND RUNNERS ==========
    getErrandRunners: builder.query({
      query: () => '/admin/errand-runners',
      providesTags: ['Admin'],
    }),
    toggleErrandRunnerStatus: builder.mutation({
      query: (id) => ({
        url: `/admin/errand-runners/${id}/toggle-status`,
        method: 'PUT',
      }),
      invalidatesTags: ['Admin', 'ErrandRunner'],
    }),

    // ========== SERVICE PROVIDERS ==========
    getServiceProviders: builder.query({
      query: () => '/admin/service-providers',
      providesTags: ['Admin'],
    }),
  }),
  overrideExisting: false,
});

export const {
  // Dashboard
  useGetDashboardStatsQuery,
  
  // Users
  useGetUsersQuery,
  useToggleUserStatusMutation,
  
  // Verification
  useGetVerificationQueueQuery,
  useVerifyProviderMutation,
  
  // Bookings
  useGetAllBookingsQuery,
  
  // Payments
  useGetAllPaymentsQuery,
  useGetPaymentStatsQuery, // ✅ ADD THIS
  useRefundPaymentMutation,
  useReleasePaymentMutation,
  
  // Reviews
  useGetAllReviewsQuery,
  useDeleteReviewMutation,
  
  // Analytics
  useGetRevenueAnalyticsQuery,
  useGetBookingAnalyticsQuery,
  
  // Errand Runners
  useGetErrandRunnersQuery,
  useToggleErrandRunnerStatusMutation,
  
  // Service Providers
  useGetServiceProvidersQuery,
} = adminApi;