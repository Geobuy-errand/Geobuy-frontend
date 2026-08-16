import { baseApi } from './api';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Update profile
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Change password
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/users/change-password',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Get provider profile
    getProviderProfile: builder.query({
      query: () => '/users/provider-profile',
      providesTags: ['User'],
    }),
    
    // Get errand runner profile
    getErrandRunnerProfile: builder.query({
      query: () => '/users/errand-runner/profile',
      providesTags: ['User'],
    }),
    
    // Update availability
    updateAvailability: builder.mutation({
      query: (data) => ({
        url: '/users/availability',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Get user by ID
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetProviderProfileQuery,
  useGetErrandRunnerProfileQuery,
  useUpdateAvailabilityMutation,
  useGetUserByIdQuery,
} = userApi;