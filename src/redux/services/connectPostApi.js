import { baseApi } from './api'

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // User gets posts based on their state
    getUserPosts: builder.query({
      query: () => '/connect-posts',
      providesTags: ['Post'],
    }),
    
    // Get connection status
    getConnectionStatus: builder.query({
      query: () => '/connect-posts/status',
      providesTags: ['Connection'],
    }),
    
    // Admin: Create post
    createPost: builder.mutation({
      query: (data) => ({
        url: '/connect-posts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),
    
    // Admin: Get all posts
    adminGetAllPosts: builder.query({
      query: (params) => `/connect-posts/admin/all?${new URLSearchParams(params)}`,
      providesTags: ['Post'],
    }),
    
    // Admin: Update post
    adminUpdatePost: builder.mutation({
      query: ({ id, data }) => ({
        url: `/connect-posts/admin/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),
    
    // Admin: Delete post
    adminDeletePost: builder.mutation({
      query: (id) => ({
        url: `/connect-posts/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetUserPostsQuery,
  useGetConnectionStatusQuery,
  useCreatePostMutation,
  useAdminGetAllPostsQuery,
  useAdminUpdatePostMutation,
  useAdminDeletePostMutation,
} = postApi