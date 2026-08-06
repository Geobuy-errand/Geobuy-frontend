import { baseApi } from './api'

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query({
      query: () => '/services',
      providesTags: ['Service'],
    }),
    getServiceById: builder.query({
      query: (id) => `/services/${id}`,
      providesTags: ['Service'],
    }),
    getServicesByCategory: builder.query({
      query: (category) => `/services/category/${category}`,
      providesTags: ['Service'],
    }),
    getPopularServices: builder.query({
      query: () => '/services/popular',
      providesTags: ['Service'],
    }),
    createService: builder.mutation({
      query: (data) => ({
        url: '/services',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Service'],
    }),
    updateService: builder.mutation({
      query: ({ id, data }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Service'],
    }),
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),
    getServiceCategories: builder.query({
      query: () => '/services/categories',
      providesTags: ['Service'],
    }),
    getServiceProviders: builder.query({
      query: (params) => `/services/providers?${new URLSearchParams(params)}`,
      providesTags: ['Service'],
    }),
    createServiceRequest: builder.mutation({
      query: (data) => ({
        url: '/services/request',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Service'],
    }),
    getServiceRequestById: builder.query({
      query: (id) => `/services/request/${id}`,
      providesTags: ['Service'],
    }),
    getMyServiceRequests: builder.query({
      query: () => '/services/my-requests',
      providesTags: ['Service'],
    }),
    getProviderServiceRequests: builder.query({
      query: () => '/services/provider-requests',
      providesTags: ['Service'],
    }),
    submitQuote: builder.mutation({
      query: (data) => ({
        url: '/services/quote',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Service'],
    }),
    getQuotes: builder.query({
      query: (requestId) => `/services/request/${requestId}/quotes`,
      providesTags: ['Service'],
    }),
    selectQuote: builder.mutation({
      query: (id) => ({
        url: `/services/quote/${id}/select`,
        method: 'PUT',
      }),
      invalidatesTags: ['Service'],
    }),
    // NEW: Accept quote
    acceptQuote: builder.mutation({
      query: ({ quoteId, finalPrice }) => ({
        url: '/services/quote/accept',
        method: 'POST',
        body: { quoteId, finalPrice },
      }),
      invalidatesTags: ['Service'],
    }),
    // NEW: Reject quote
    rejectQuote: builder.mutation({
      query: ({ quoteId, reason }) => ({
        url: '/services/quote/reject',
        method: 'POST',
        body: { quoteId, reason },
      }),
      invalidatesTags: ['Service'],
    }),
    // NEW: Negotiate quote (counter-offer)
    negotiateQuote: builder.mutation({
      query: ({ quoteId, counterAmount, message }) => ({
        url: '/services/quote/negotiate',
        method: 'POST',
        body: { quoteId, counterAmount, message },
      }),
      invalidatesTags: ['Service'],
    }),
    // NEW: Cancel service request
    cancelServiceRequest: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/services/request/${id}/cancel`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: ['Service'],
    }),
    // NEW: Complete service request
    completeServiceRequest: builder.mutation({
      query: (id) => ({
        url: `/services/request/${id}/complete`,
        method: 'PUT',
      }),
      invalidatesTags: ['Service'],
    }),
    // NEW: Start service request (provider)
    startServiceRequest: builder.mutation({
      query: (id) => ({
        url: `/services/request/${id}/start`,
        method: 'PUT',
      }),
      invalidatesTags: ['Service'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useGetServicesByCategoryQuery,
  useGetPopularServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetServiceCategoriesQuery,
  useGetServiceProvidersQuery,
  useCreateServiceRequestMutation,
  useGetServiceRequestByIdQuery,
  useGetMyServiceRequestsQuery,
  useGetProviderServiceRequestsQuery,
  useSubmitQuoteMutation,
  useGetQuotesQuery,
  useSelectQuoteMutation,
  // NEW: Export the new hooks
  useAcceptQuoteMutation,
  useRejectQuoteMutation,
  useNegotiateQuoteMutation,
  useCancelServiceRequestMutation,
  useCompleteServiceRequestMutation,
  useStartServiceRequestMutation,
} = serviceApi