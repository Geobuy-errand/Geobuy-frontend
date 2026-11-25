// The login token, kept so the app can send it as "Authorization: Bearer".
//
// Why: the backend also sets an httpOnly cookie, but when the app and the API
// are on different domains that cookie is a cross-site cookie, which Safari
// (every iPhone/iPad browser) and other privacy-focused browsers block. The
// result was that iPhone users appeared logged in but every request failed.
const KEY = 'geobuy_token'

export function getAuthToken() {
  try {
    return localStorage.getItem(KEY) || null
  } catch {
    return null
  }
}

export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem(KEY, token)
  } catch {
    // private mode / storage disabled — the cookie may still work
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

/** Socket.io options that authenticate the same way as HTTP requests. */
export function socketAuthOptions(extra = {}) {
  const token = getAuthToken()
  return { withCredentials: true, ...(token ? { auth: { token } } : {}), ...extra }
}
