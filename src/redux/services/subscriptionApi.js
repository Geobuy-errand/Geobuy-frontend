import { baseApi } from './api';

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get available plans
    getPlans: builder.query({
      query: () => '/subscription/plans',
      providesTags: ['Subscription'],
    }),
    
    // Get subscription status
    getSubscriptionStatus: builder.query({
      query: () => '/subscription/status',
      providesTags: ['Subscription'],
    }),
    
    // Create checkout session
    createCheckoutSession: builder.mutation({
      query: (data) => ({
        url: '/subscription/create-checkout',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),
    
    // Cancel subscription
    cancelSubscription: builder.mutation({
      query: () => ({
        url: '/subscription/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),
    
    // Resume subscription
    resumeSubscription: builder.mutation({
      query: () => ({
        url: '/subscription/resume',
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),
    
    // Admin: Get subscription history
    getSubscriptionHistory: builder.query({
      query: () => '/subscription/admin/history',
      providesTags: ['Subscription'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPlansQuery,
  useGetSubscriptionStatusQuery,
  useCreateCheckoutSessionMutation,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  useGetSubscriptionHistoryQuery,
} = subscriptionApi;