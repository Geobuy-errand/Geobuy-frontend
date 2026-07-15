import { baseApi } from './api'

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation({
      query: (data) => ({
        url: '/payments/create-payment-intent',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment'],
    }),
    releaseFunds: builder.mutation({
      query: (data) => ({
        url: '/payments/release-funds',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Booking'],
    }),
    getPaymentByBooking: builder.query({
      query: (bookingId) => `/payments/booking/${bookingId}`,
      providesTags: ['Payment'],
    }),
    getMyPayments: builder.query({
      query: () => '/payments/my-payments',
      providesTags: ['Payment'],
    }),
    refundPayment: builder.mutation({
      query: (data) => ({
        url: '/payments/refund',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Booking'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useCreatePaymentIntentMutation,
  useReleaseFundsMutation,
  useGetPaymentByBookingQuery,
  useGetMyPaymentsQuery,
  useRefundPaymentMutation,
} = paymentApi