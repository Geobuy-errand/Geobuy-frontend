import { baseApi } from './api'

export const providerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProviderProfile: builder.query({
      query: () => '/users/provider-profile',
      providesTags: ['Provider'],
    }),
    updateAvailability: builder.mutation({
      query: (data) => ({
        url: '/users/availability',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Provider', 'User'],
    }),
    getAvailableProviders: builder.query({
      query: (params) => `/users/available-providers?${new URLSearchParams(params)}`,
      providesTags: ['Provider'],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/users/change-password',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetProviderProfileQuery,
  useUpdateAvailabilityMutation,
  useGetAvailableProvidersQuery,
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = providerApi