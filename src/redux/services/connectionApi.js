import { baseApi } from './api'

export const connectionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create payment intent
    createPaymentIntent: builder.mutation({
      query: () => ({
        url: '/connections/create-payment-intent',
        method: 'POST',
      }),
    }),
    
    // Confirm payment
    confirmPayment: builder.mutation({
      query: (data) => ({
        url: '/connections/confirm-payment',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Connection'],
    }),
    // updates
    checkPaymentStatus: builder.query({
      query: () => '/connections/check-payment-status',
      providesTags: ['Connection'],
    }),
    
    // Create Stripe Checkout Session (No frontend Stripe.js needed)
    createCheckoutSession: builder.mutation({
      query: () => ({
        url: '/connections/create-checkout-session',
        method: 'POST',
      }),
    }),
    
    // Verify payment after redirect
    verifyPayment: builder.query({
      query: (sessionId) => `/connections/verify-payment?session_id=${sessionId}`,
    }),
    
    // Create connection
    createConnection: builder.mutation({
      query: (data) => ({
        url: '/connections',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Connection'],
    }),
    getConnectionStatus: builder.query({
      query: () => '/connections/status',
      providesTags: ['Connection'],
    }),
    getConnectionFee: builder.query({
      query: () => '/connections/connection-fee',
      providesTags: ['Connection'],
    }),
    getMyConnections: builder.query({
      query: (params) => `/connections/my-connections?${new URLSearchParams(params)}`,
      providesTags: ['Connection'],
    }),
    
    getConnectionById: builder.query({
      query: (id) => `/connections/${id}`,
      providesTags: ['Connection'],
    }),
    
    updateConnection: builder.mutation({
      query: ({ id, data }) => ({
        url: `/connections/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Connection'],
    }),
    
    cancelConnection: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/connections/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Connection'],
    }),
    
    rateConnection: builder.mutation({
      query: ({ id, score, feedback }) => ({
        url: `/connections/${id}/rate`,
        method: 'POST',
        body: { score, feedback },
      }),
      invalidatesTags: ['Connection'],
    }),
    
    adminGetConnections: builder.query({
      query: (params) => `/connections/admin/all?${new URLSearchParams(params)}`,
      providesTags: ['Connection'],
    }),
    
    adminUpdateConnection: builder.mutation({
      query: ({ id, data }) => ({
        url: `/connections/admin/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Connection'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useCreateCheckoutSessionMutation,
  useVerifyPaymentQuery,
  useCheckPaymentStatusQuery,
  useCreatePaymentIntentMutation,
  useConfirmPaymentMutation,
  useCreateConnectionMutation,
  useGetMyConnectionsQuery,
  useGetConnectionByIdQuery,
  useUpdateConnectionMutation,
  useCancelConnectionMutation,
  useRateConnectionMutation,
  useAdminGetConnectionsQuery,
  useAdminUpdateConnectionMutation,
  useGetConnectionStatusQuery,
  useGetConnectionFeeQuery
} = connectionApi