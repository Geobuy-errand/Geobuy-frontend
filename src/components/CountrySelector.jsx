import React from 'react'
import { COUNTRY_LIST } from '../config/countries'
import useCountry from '../hooks/useCountry'

/**
 * UK / Nigeria switcher.
 *  - variant="compact": small pill for the navbar (visitors only)
 *  - variant="cards":   big choice cards for sign-up forms
 * When `value`/`onChange` are passed it acts as a controlled form field.
 */
const CountrySelector = ({ value, onChange, variant = 'compact', className = '', label = 'Where will you use GEOBUY?' }) => {
  const { code, setCountry, isLocked } = useCountry()
  const current = value || code
  const handle = (c) => {
    if (onChange) onChange(c)
    else setCountry(c)
  }

  if (variant === 'cards') {
    return (
      <div className={className}>
        {label && <label className="block text-sm font-medium text-text mb-2">{label}</label>}
        <div className="grid grid-cols-2 gap-3">
          {COUNTRY_LIST.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => handle(c.code)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                current === c.code ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl" aria-hidden="true">{c.flag}</span>
              <span>
                <span className="block font-semibold text-text">{c.name}</span>
                <span className="block text-xs text-text-light">Pay in {c.currency} ({c.currencySymbol})</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Signed-in users can't switch — their account belongs to one country.
  if (isLocked && !onChange) return null

  return (
    <div className={`inline-flex rounded-full border border-gray-200 bg-white p-0.5 text-xs ${className}`} role="group" aria-label="Country">
      {COUNTRY_LIST.map((c) => (
        <button
          key={c.code}
          type="button"
          onClick={() => handle(c.code)}
          aria-pressed={current === c.code}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            current === c.code ? 'bg-primary text-white' : 'text-text-light hover:text-text'
          }`}
        >
          <span aria-hidden="true">{c.flag}</span> {c.shortName}
        </button>
      ))}
    </div>
  )
}

export default CountrySelector
