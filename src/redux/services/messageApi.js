import { baseApi } from './api'

export const messageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query({
      query: (bookingId) => `/messages/booking/${bookingId}`,
      providesTags: ['Message'],
    }),
    sendMessage: builder.mutation({
      query: (data) => ({
        url: '/messages',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Message'],
    }),
    markMessageRead: builder.mutation({
      query: (id) => ({
        url: `/messages/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Message'],
    }),
    getUnreadCount: builder.query({
      query: () => '/messages/unread/count',
      providesTags: ['Message'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkMessageReadMutation,
  useGetUnreadCountQuery,
} = messageApi