import { baseApi } from './api'

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========== SERVICE CRUD ==========
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

    // ========== SERVICE CATEGORIES (Dynamic - Admin Managed) ==========
    getServiceCategories: builder.query({
      query: () => '/services/categories',
      providesTags: ['ServiceCategory'],
    }),
    createServiceCategory: builder.mutation({
      query: (data) => ({
        url: '/services/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ServiceCategory'],
    }),
    updateServiceCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/services/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ServiceCategory'],
    }),
    deleteServiceCategory: builder.mutation({
      query: (id) => ({
        url: `/services/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServiceCategory'],
    }),

    // ========== SERVICE PROVIDERS ==========
    getServiceProviders: builder.query({
      query: (params) => `/services/providers?${new URLSearchParams(params)}`,
      providesTags: ['Service'],
    }),

    // ========== SERVICE REQUESTS (Customer) ==========
    getServiceRequests: builder.query({
      query: () => '/services/my-requests',
      providesTags: ['Service'],
    }),
    getServiceRequestById: builder.query({
      query: (id) => `/services/request/${id}`,
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
    cancelServiceRequest: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/services/request/${id}/cancel`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: ['Service'],
    }),
    completeServiceRequest: builder.mutation({
      query: (id) => ({
        url: `/services/request/${id}/complete`,
        method: 'PUT',
      }),
      invalidatesTags: ['Service'],
    }),

    // ========== PROVIDER SERVICE REQUESTS ==========
    getProviderServiceRequests: builder.query({
      query: () => '/services/provider-requests',
      providesTags: ['Service'],
    }),

    // ========== QUOTES ==========
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
    inviteProviders: builder.mutation({
      query: ({ requestId, providerIds }) => ({
        url: `/services/request/${requestId}/invite`,
        method: 'POST',
        body: { providerIds },
      }),
      invalidatesTags: ['Service'],
    }),
    acceptQuote: builder.mutation({
      query: ({ quoteId, finalPrice }) => ({
        url: '/services/quote/accept',
        method: 'POST',
        body: { quoteId, finalPrice },
      }),
      invalidatesTags: ['Service'],
    }),
    rejectQuote: builder.mutation({
      query: ({ quoteId, reason }) => ({
        url: '/services/quote/reject',
        method: 'POST',
        body: { quoteId, reason },
      }),
      invalidatesTags: ['Service'],
    }),
    negotiateQuote: builder.mutation({
      query: ({ quoteId, counterAmount, message }) => ({
        url: '/services/quote/negotiate',
        method: 'POST',
        body: { quoteId, counterAmount, message },
      }),
      invalidatesTags: ['Service'],
    }),

    // ========== PROVIDER ACTIONS ==========
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

// ============================================================
// EXPORT ALL HOOKS
// ============================================================
export const {
  // Services
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useGetServicesByCategoryQuery,
  useGetPopularServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,

  // Categories (Dynamic)
  useGetServiceCategoriesQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,

  // Providers
  useGetServiceProvidersQuery,

  // Service Requests (Customer)
  useGetServiceRequestsQuery,
  useGetServiceRequestByIdQuery,
  useCreateServiceRequestMutation,
  useCancelServiceRequestMutation,
  useCompleteServiceRequestMutation,

  // Provider Service Requests
  useGetProviderServiceRequestsQuery,

  // Quotes
  useSubmitQuoteMutation,
  useGetQuotesQuery,
  useSelectQuoteMutation,
  useAcceptQuoteMutation,
  useRejectQuoteMutation,
  useNegotiateQuoteMutation,

  // Provider Actions
  useStartServiceRequestMutation,
  useInviteProvidersMutation,
} = serviceApi