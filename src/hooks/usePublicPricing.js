import { useEffect, useState } from 'react'
import http from '../services/http'
import useCountry from './useCountry'

// ============================================================
// Public settings for the current country — prices, fees, time limits,
// feature switches and contact details — straight from Admin → Settings.
//
// There are deliberately NO built-in prices here: the admin settings are the
// single source of truth. While they load, money values show as "…".
// ============================================================

const CACHE_MS = 5 * 60 * 1000
const cache = {} // country -> { data, at }
const listeners = new Set()

/** Call after an admin saves settings so every open page refetches. */
export function invalidatePublicSettings() {
  for (const k of Object.keys(cache)) delete cache[k]
  listeners.forEach((fn) => fn())
}

async function load(code) {
  const hit = cache[code]
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data
  const { data } = await http.get(`/settings/public?country=${code}`)
  cache[code] = { data, at: Date.now() }
  return data
}

export default function usePublicPricing() {
  const c = useCountry()
  const [data, setData] = useState(cache[c.code]?.data || null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1)
    listeners.add(bump)
    return () => listeners.delete(bump)
  }, [])

  useEffect(() => {
    let cancelled = false
    load(c.code)
      .then((d) => !cancelled && setData(d))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [c.code, version])

  const pricing = data?.pricing || {}
  const ready = Boolean(data)
  // "…" instead of £0.00 / ₦NaN while settings load
  const format = (v) => (v === undefined || v === null || Number.isNaN(Number(v)) ? '…' : c.format(v))

  return {
    ...c,
    format,
    ready,
    pricing,
    operations: data?.operations || {},
    features: data?.features || {},
    connectionFee: pricing.connectionFee,
    baseFee: pricing.baseFee,
    firstRate: pricing.tiers?.[0]?.rate,
    platformFeePercentage: pricing.platformFeePercentage,
    providerCommissionPercentage: pricing.providerCommissionPercentage,
    contactEmail: data?.platform?.contactEmail || '',
    contactPhone: data?.platform?.contactPhone || '',
  }
}
