import { baseApi } from './api'

export const errandRunnerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getErrandRunnerProfile: builder.query({
      query: () => '/users/errand-runner/profile',
      providesTags: ['ErrandRunner'],
    }),
    getAvailableErrandRunners: builder.query({
      query: (params) => `/users/errand-runners/available?${new URLSearchParams(params)}`,
      providesTags: ['ErrandRunner'],
    }),
    getErrandRunnerById: builder.query({
      query: (id) => `/users/errand-runner/${id}`,
      providesTags: ['ErrandRunner'],
    }),
    updateErrandRunnerAvailability: builder.mutation({
      query: (data) => ({
        url: '/users/errand-runner/availability',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ErrandRunner'],
    }),
    updateErrandRunnerProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ErrandRunner', 'User'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetErrandRunnerProfileQuery,
  useGetAvailableErrandRunnersQuery,
  useGetErrandRunnerByIdQuery,
  useUpdateErrandRunnerAvailabilityMutation,
  useUpdateErrandRunnerProfileMutation,
} = errandRunnerApi