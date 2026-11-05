import { getCountry, getCountryByCurrency } from '../config/countries'

/**
 * Format an amount: formatMoney(1500, 'NGN') -> "₦1,500.00", formatMoney(3.99, 'GBP') -> "£3.99".
 * The second argument can be a currency (GBP/NGN) or a country (GB/NG).
 */
export function formatMoney(amount, currencyOrCountry = 'GBP', { decimals } = {}) {
  const key = String(currencyOrCountry || 'GBP').toUpperCase()
  const country = key.length === 2 ? getCountry(key) : getCountryByCurrency(key)
  const value = Number(amount) || 0
  const digits = decimals ?? 2
  try {
    return new Intl.NumberFormat(country.locale, {
      style: 'currency',
      currency: country.currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value)
  } catch {
    return `${country.currencySymbol}${value.toFixed(digits)}`
  }
}

/** Currency symbol for a currency/country code. */
export function currencySymbol(currencyOrCountry = 'GBP') {
  const key = String(currencyOrCountry || 'GBP').toUpperCase()
  return (key.length === 2 ? getCountry(key) : getCountryByCurrency(key)).currencySymbol
}

const KM_PER_MILE = 1.609344

/** Distance stored in km -> "3.2 miles" (UK) / "5.1 km" (NG) */
export function formatDistanceKm(km, country = 'GB') {
  const c = getCountry(country)
  const n = Number(km) || 0
  const v = c.distanceUnit === 'mi' ? n / KM_PER_MILE : n
  return `${v.toFixed(1)} ${c.distanceUnitLabel}`
}

/** Distance already in the record's own unit -> text */
export function formatDistance(value, unitOrCountry = 'mi') {
  const unit = unitOrCountry === 'NG' || unitOrCountry === 'km' ? 'km' : 'miles'
  return `${(Number(value) || 0).toFixed(1)} ${unit}`
}
