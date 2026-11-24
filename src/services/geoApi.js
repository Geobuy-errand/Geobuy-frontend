// Address search through the Geobuy backend (/api/geo).
// The backend picks the best provider (Google Places if configured, otherwise
// OpenStreetMap/Photon) and falls back to a built-in list of towns and areas.
import http from './http'

let session = null
let sessionStarted = 0

/** One token per typing session (Google bills search + details together). */
export const geoSession = () => {
  if (!session || Date.now() - sessionStarted > 3 * 60 * 1000) {
    session = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionStarted = Date.now()
  }
  return session
}
export const endGeoSession = () => {
  session = null
}

export async function searchAddresses(q, { country, near, signal } = {}) {
  const params = { q, country, session: geoSession() }
  if (near?.lat != null && near?.lng != null) Object.assign(params, { lat: near.lat, lng: near.lng })
  const { data } = await http.get('/geo/search', { params, signal })
  return data?.results || []
}

export async function placeDetails(id) {
  const { data } = await http.get(`/geo/place/${encodeURIComponent(id)}`, { params: { session: geoSession() } })
  endGeoSession()
  return data
}

export async function reverseGeocode(lat, lng, country) {
  const { data } = await http.get('/geo/reverse', { params: { lat, lng, country } })
  return data
}
