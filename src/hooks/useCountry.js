import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getCountry, normalizeCountry, DEFAULT_COUNTRY } from '../config/countries'
import { formatMoney, formatDistanceKm } from '../utils/money'

const STORAGE_KEY = 'geobuy_country'
const EVENT = 'geobuy-country-change'

function readStoredCountry() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v) return normalizeCountry(v)
  } catch {
    // storage unavailable
  }
  // First visit: guess from the browser time zone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (tz === 'Africa/Lagos') return 'NG'
  } catch {
    // ignore
  }
  return DEFAULT_COUNTRY
}

/** Set the visitor's country (used on public pages before sign-in). */
export function setVisitorCountry(code) {
  const c = normalizeCountry(code)
  try {
    localStorage.setItem(STORAGE_KEY, c)
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: c }))
}

/**
 * The country the UI should use:
 *  - a signed-in user's account country (fixed), otherwise
 *  - the visitor's chosen country (switcher in the navbar)
 */
export default function useCountry() {
  const user = useSelector((state) => state.auth?.user)
  const [visitorCountry, setVisitor] = useState(readStoredCountry)

  useEffect(() => {
    const onChange = (e) => setVisitor(normalizeCountry(e.detail))
    window.addEventListener(EVENT, onChange)
    return () => window.removeEventListener(EVENT, onChange)
  }, [])

  const code = user?.country ? normalizeCountry(user.country) : visitorCountry
  const country = getCountry(code)

  const format = useCallback((amount, currency) => formatMoney(amount, currency || country.currency), [country.currency])
  const formatKm = useCallback((km) => formatDistanceKm(km, code), [code])

  return {
    code,
    country,
    currency: country.currency,
    symbol: country.currencySymbol,
    distanceUnit: country.distanceUnit,
    distanceUnitLabel: country.distanceUnitLabel,
    isNigeria: code === 'NG',
    isUK: code === 'GB',
    isLocked: Boolean(user?.country),
    format,
    formatKm,
    setCountry: setVisitorCountry,
  }
}
