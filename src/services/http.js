import axios from 'axios'
import { getAuthToken } from './authToken'

// VITE_API_URL should include /api, e.g. https://api.geobuy.com/api
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

// Socket.io lives at the server root, not under /api. Connecting to
// ".../api" makes socket.io treat "/api" as a namespace and fail.
export const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || API_URL.replace(/\/api$/, '')).replace(/\/$/, '')

/**
 * Shared axios instance. Use this instead of `axios.get('/api/...')`:
 * relative '/api' URLs only work with the Vite dev proxy and break in production.
 * Pass paths WITHOUT the /api prefix: http.get('/errands/123').
 */
const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Accept legacy '/api/...' paths too
http.interceptors.request.use((config) => {
  if (typeof config.url === 'string' && config.url.startsWith('/api/')) {
    config.url = config.url.slice(4)
  }
  // Send the login token as a header too (Safari/iOS block cross-site cookies)
  const token = getAuthToken()
  if (token && !config.headers?.Authorization) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default http
