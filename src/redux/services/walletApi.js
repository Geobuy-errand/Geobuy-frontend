import { baseApi } from './api'

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query({
      query: () => '/wallet',
      providesTags: ['Wallet'],
    }),
    getTransactions: builder.query({
      query: () => '/wallet/transactions',
      providesTags: ['Wallet'],
    }),
    requestWithdrawal: builder.mutation({
      query: (data) => ({
        url: '/wallet/withdraw',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet'],
    }),
    getWithdrawals: builder.query({
      query: () => '/wallet/withdrawals',
      providesTags: ['Wallet'],
    }),
    processWithdrawal: builder.mutation({
      query: ({ id, data }) => ({
        url: `/wallet/withdrawals/${id}/process`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Wallet'],
    }),
    getAdminWithdrawals: builder.query({
      query: () => '/wallet/admin/withdrawals',
      providesTags: ['Wallet'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetWalletQuery,
  useGetTransactionsQuery,
  useRequestWithdrawalMutation,
  useGetWithdrawalsQuery,
  useProcessWithdrawalMutation,
  useGetAdminWithdrawalsQuery,
} = walletApi