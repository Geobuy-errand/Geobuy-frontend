import React from 'react'
import { FaHome, FaCity, FaMapPin, FaMapMarkedAlt } from 'react-icons/fa'
import { getCountry } from '../../config/countries'
import { NG_STATES, NG_STATE_NAMES } from '../../config/locations'

/**
 * Address inputs that adapt to the country:
 *   UK:      Street, Town/City, Postcode (required)
 *   Nigeria: Street, Area, City/Town, State (required), Postal code (optional)
 *
 * Renders grid cells — place inside an existing `grid md:grid-cols-2`.
 * Uses `name="address.<field>"` so it works with the forms' existing handleChange.
 */
const CountryAddressFields = ({ country = 'GB', address = {}, onChange, required = true }) => {
  const c = getCountry(country)
  const isNG = c.code === 'NG'
  const cities = isNG && address.state ? NG_STATES[address.state] || [] : []

  const field = (name, label, icon, props = {}) => {
    const Icon = icon
    return (
      <div>
        <label className="block text-sm font-medium text-text-light mb-1">
          {label}
          {props.required ? ' *' : ''}
        </label>
        <div className="relative">
          {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />}
          <input
            type="text"
            name={`address.${name}`}
            value={address[name] || ''}
            onChange={onChange}
            className={`input-field ${Icon ? 'pl-10' : ''}`}
            {...props}
          />
        </div>
      </div>
    )
  }

  return (
    <>
      {field('street', 'Street Address', FaHome, {
        placeholder: isNG ? '12 Admiralty Way' : '123 Main Street',
        required,
      })}

      {isNG &&
        field('area', 'Area / Estate', FaMapMarkedAlt, {
          placeholder: 'e.g. Lekki Phase 1, Wuse 2, GRA',
        })}

      {isNG && (
        <div>
          <label className="block text-sm font-medium text-text-light mb-1">State{required ? ' *' : ''}</label>
          <select name="address.state" value={address.state || ''} onChange={onChange} className="input-field" required={required}>
            <option value="">Select state...</option>
            {NG_STATE_NAMES.map((s) => (
              <option key={s} value={s}>
                {s === 'Federal Capital Territory' ? 'Abuja (FCT)' : s}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-light mb-1">
          {isNG ? 'City / Town / LGA' : 'Town/City'}
          {required ? ' *' : ''}
        </label>
        <div className="relative">
          <FaCity className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            name="address.town"
            value={address.town || ''}
            onChange={onChange}
            className="input-field pl-10"
            placeholder={isNG ? (cities[0] ? `e.g. ${cities[0]}` : 'e.g. Ikeja') : 'London'}
            list={isNG ? 'ng-city-options' : undefined}
            required={required}
          />
          {isNG && (
            <datalist id="ng-city-options">
              {cities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          )}
        </div>
      </div>

      {field('postcode', isNG ? 'Postal code (optional)' : 'Postcode', FaMapPin, {
        placeholder: c.postcodePlaceholder,
        required: required && c.postcodeRequired,
        inputMode: isNG ? 'numeric' : undefined,
      })}
    </>
  )
}

export default CountryAddressFields
