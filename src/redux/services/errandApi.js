
import { baseApi } from './api'

export const errandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getErrands: builder.query({
      query: () => '/errands',
      providesTags: ['Errand'],
    }),
    getErrandById: builder.query({
      query: (id) => `/errands/${id}`,
      providesTags: ['Errand'],
    }),
    getAvailableErrands: builder.query({
      query: () => '/errands/available',
      providesTags: ['Errand'],
    }),
    createErrand: builder.mutation({
      query: (data) => ({
        url: '/errands',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Errand'],
    }),
    acceptErrand: builder.mutation({
      query: (id) => ({
        url: `/errands/${id}/accept`,
        method: 'PUT',
      }),
      invalidatesTags: ['Errand'],
    }),
    updateErrandStatus: builder.mutation({
      query: ({ id, status, location }) => ({
        url: `/errands/${id}/status`,
        method: 'PUT',
        body: { status, location },
      }),
      invalidatesTags: ['Errand'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetErrandsQuery,
  useGetErrandByIdQuery,
  useGetAvailableErrandsQuery,
  useCreateErrandMutation,
  useAcceptErrandMutation,
  useUpdateErrandStatusMutation,
} = errandApi