import { baseApi } from './api';

export const subscriptionPlanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public: Get active plans
    getActivePlans: builder.query({
      query: () => '/subscription-plans/active',
      providesTags: ['SubscriptionPlan'],
    }),
    
    // Admin: Get all plans
    getAllPlans: builder.query({
      query: () => '/subscription-plans',
      providesTags: ['SubscriptionPlan'],
    }),
    
    // Admin: Get plan by ID
    getPlanById: builder.query({
      query: (id) => `/subscription-plans/${id}`,
      providesTags: ['SubscriptionPlan'],
    }),
    
    // Admin: Create plan
    createPlan: builder.mutation({
      query: (data) => ({
        url: '/subscription-plans',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),
    
    // Admin: Update plan
    updatePlan: builder.mutation({
      query: ({ id, data }) => ({
        url: `/subscription-plans/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),
    
    // Admin: Delete plan
    deletePlan: builder.mutation({
      query: (id) => ({
        url: `/subscription-plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),
    
    // Admin: Toggle plan status
    togglePlanStatus: builder.mutation({
      query: (id) => ({
        url: `/subscription-plans/${id}/toggle`,
        method: 'PUT',
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),
    
    // Admin: Seed default plans
    seedPlans: builder.mutation({
      query: () => ({
        url: '/subscription-plans/seed',
        method: 'POST',
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetActivePlansQuery,
  useGetAllPlansQuery,
  useGetPlanByIdQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useTogglePlanStatusMutation,
  useSeedPlansMutation,
} = subscriptionPlanApi;