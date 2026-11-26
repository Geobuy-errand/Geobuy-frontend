import { baseApi } from './api'

// Identity checks with Didit (NIN for Nigeria, ID + selfie for the UK)
export const identityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIdentityStatus: builder.query({
      query: () => '/verifications/identity/status',
      providesTags: ['Identity'],
    }),
    startIdentityCheck: builder.mutation({
      query: (body = {}) => ({ url: '/verifications/identity/start', method: 'POST', body }),
      invalidatesTags: ['Identity', 'User'],
    }),
    confirmIdentityPayment: builder.mutation({
      query: (body) => ({ url: '/verifications/identity/confirm-payment', method: 'POST', body }),
      invalidatesTags: ['Identity', 'User'],
    }),
    refreshIdentityCheck: builder.mutation({
      query: () => ({ url: '/verifications/identity/refresh', method: 'POST' }),
      invalidatesTags: ['Identity', 'User'],
    }),
    // admin
    getIdentityChecks: builder.query({
      query: (params = {}) => `/verifications/identity/admin?${new URLSearchParams(params)}`,
      providesTags: ['Identity'],
    }),
    reviewIdentityCheck: builder.mutation({
      query: ({ id, decision, note }) => ({ url: `/verifications/identity/admin/${id}`, method: 'PUT', body: { decision, note } }),
      invalidatesTags: ['Identity', 'Admin', 'User'],
    }),
    markIdentityVerified: builder.mutation({
      query: ({ userId, note }) => ({ url: `/verifications/identity/admin/user/${userId}/mark-verified`, method: 'POST', body: { note } }),
      invalidatesTags: ['Identity', 'Admin', 'User'],
    }),
  }),
})

export const {
  useGetIdentityStatusQuery,
  useStartIdentityCheckMutation,
  useConfirmIdentityPaymentMutation,
  useRefreshIdentityCheckMutation,
  useGetIdentityChecksQuery,
  useReviewIdentityCheckMutation,
  useMarkIdentityVerifiedMutation,
} = identityApi
