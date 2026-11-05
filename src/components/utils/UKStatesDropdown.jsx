import React from 'react'
import useCountry from '../../hooks/useCountry'
import { UK_REGIONS, NG_STATE_NAMES } from '../../config/locations'

// Values match the backend enum exactly (e.g. 'London', 'Lagos').
// The old list sent lowercase values ('london'), which the backend rejected.
export const UK_STATES = UK_REGIONS.filter((r) => r !== 'All UK').map((r) => ({ value: r, label: `📍 ${r}` }))
export const NG_STATES_OPTIONS = NG_STATE_NAMES.map((s) => ({ value: s, label: `📍 ${s === 'Federal Capital Territory' ? 'Abuja (FCT)' : s}` }))

export const statesForCountry = (country, { includeCountryWide = false } = {}) => {
  const base = country === 'NG' ? NG_STATES_OPTIONS : UK_STATES
  if (!includeCountryWide) return base
  return [...base, country === 'NG' ? { value: 'All Nigeria', label: '🌍 All Nigeria' } : { value: 'All UK', label: '🌍 All UK' }]
}

/**
 * Region / state picker. UK users see cities & regions; Nigerian users see the 36 states + FCT.
 * Admin screens can pass `country="ALL"` to see both lists.
 */
const UKStatesDropdown = ({
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  country: countryProp,
  includeCountryWide = false,
}) => {
  const { code } = useCountry()
  const country = countryProp || code

  const groups =
    country === 'ALL'
      ? [
          { label: 'United Kingdom', options: statesForCountry('GB', { includeCountryWide }) },
          { label: 'Nigeria', options: statesForCountry('NG', { includeCountryWide }) },
        ]
      : [{ label: null, options: statesForCountry(country, { includeCountryWide }) }]

  const ph = placeholder || (country === 'NG' ? 'Select your state...' : 'Select your state or city...')

  return (
    <select value={value} onChange={onChange} required={required} className={`input-field ${className}`}>
      <option value="">{ph}</option>
      {groups.map((g) =>
        g.label ? (
          <optgroup key={g.label} label={g.label}>
            {g.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ) : (
          g.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))
        )
      )}
    </select>
  )
}

export default UKStatesDropdown
