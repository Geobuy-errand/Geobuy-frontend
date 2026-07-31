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
  useSubmitQuoteMutation,
  useGetQuotesQuery,
  useSelectQuoteMutation,

} = serviceApi
