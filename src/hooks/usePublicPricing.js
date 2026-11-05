import { useEffect, useState } from 'react'
import http from '../services/http'
import useCountry from './useCountry'

const cache = {}

/** Public prices for the current country (from admin settings), with sensible fallbacks. */
export default function usePublicPricing() {
  const c = useCountry()
  const [data, setData] = useState(cache[c.code] || null)

  useEffect(() => {
    if (cache[c.code]) {
      setData(cache[c.code])
      return
    }
    let cancelled = false
    http
      .get(`/settings/public?country=${c.code}`)
      .then((r) => {
        cache[c.code] = r.data
        if (!cancelled) setData(r.data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [c.code])

  const fallback = c.isNigeria
    ? { baseFee: 1500, connectionFee: 1000, tiers: [{ upTo: 5, rate: 200 }] }
    : { baseFee: 3.99, connectionFee: 1.99, tiers: [{ upTo: 3, rate: 0.8 }] }
  const pricing = { ...fallback, ...(data?.pricing || {}) }
  const firstRate = pricing.tiers?.[0]?.rate ?? fallback.tiers[0].rate

  return {
    ...c,
    pricing,
    connectionFee: pricing.connectionFee,
    baseFee: pricing.baseFee,
    firstRate,
    contactEmail: data?.platform?.contactEmail || c.country.supportEmail,
    contactPhone: data?.platform?.contactPhone || c.country.supportPhone,
  }
}
