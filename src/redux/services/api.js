import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../../services/authToken';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      // Login token as a header too (Safari/iOS block cross-site cookies)
      const token = getAuthToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['User', 'Booking', 'Payment', 'Provider', 'Service', 'Message', 'Review', 'Wallet', 'Admin', 'WalletTransaction', 'Errand', 'Subscription', 'Identity'],
  endpoints: () => ({}),
});
