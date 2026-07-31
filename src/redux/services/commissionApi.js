import { baseApi } from './api';

export const commissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyCommissions: builder.query({
      query: () => '/commissions/my',
      providesTags: ['Commission'],
    }),
    getCommissionById: builder.query({
      query: (id) => `/commissions/${id}`,
      providesTags: ['Commission'],
    }),
    generateCommission: builder.mutation({
      query: (data) => ({
        url: '/commissions/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Commission'],
    }),
    autoGenerateCommission: builder.mutation({
      query: (data) => ({
        url: '/commissions/auto-generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Commission'],
    }),
    markCommissionPaid: builder.mutation({
      query: ({ id, data }) => ({
        url: `/commissions/${id}/pay`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Commission'],
    }),
    cancelCommission: builder.mutation({
      query: ({ id, data }) => ({
        url: `/commissions/${id}/cancel`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Commission'],
    }),
    getCommissionStats: builder.query({
      query: () => '/commissions/stats/my',
      providesTags: ['Commission'],
    }),
    getAllCommissions: builder.query({
      query: (params) => `/commissions/admin/all?${new URLSearchParams(params)}`,
      providesTags: ['Commission'],
    }),
    getCommissionSummary: builder.query({
      query: () => '/commissions/admin/summary',
      providesTags: ['Commission'],
    }),
    getInvoice: builder.query({
      query: (id) => `/commissions/${id}/invoice`,
      providesTags: ['Commission'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyCommissionsQuery,
  useGetCommissionByIdQuery,
  useGenerateCommissionMutation,
  useAutoGenerateCommissionMutation,
  useMarkCommissionPaidMutation,
  useCancelCommissionMutation,
  useGetCommissionStatsQuery,
  useGetAllCommissionsQuery,
  useGetCommissionSummaryQuery,
  useGetInvoiceQuery,
} = commissionApi;