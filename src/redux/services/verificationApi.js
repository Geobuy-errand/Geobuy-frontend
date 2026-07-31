import { baseApi } from './api'

export const verificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitVerification: builder.mutation({
      query: (data) => ({
        url: '/verifications',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    getMyVerifications: builder.query({
      query: () => '/verifications/my',
      providesTags: ['User'],
    }),
    getPendingVerifications: builder.query({
      query: () => '/verifications/pending',
      providesTags: ['Admin'],
    }),
    reviewVerification: builder.mutation({
      query: ({ id, data }) => ({
        url: `/verifications/${id}/review`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Admin', 'User'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useSubmitVerificationMutation,
  useGetMyVerificationsQuery,
  useGetPendingVerificationsQuery,
  useReviewVerificationMutation,
} = verificationApi