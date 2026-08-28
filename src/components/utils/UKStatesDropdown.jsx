import React from 'react'

export const UK_STATES = [
  { value: 'england', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England' },
  { value: 'scotland', label: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland' },
  { value: 'wales', label: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales' },
  { value: 'northern_ireland', label: '🇮🇪 Northern Ireland' },
]

export const UK_REGIONS = {
  england: { lat: 52.3555, lng: -1.1743 },
  scotland: { lat: 56.4907, lng: -4.2026 },
  wales: { lat: 52.1307, lng: -3.7837 },
  northern_ireland: { lat: 54.7877, lng: -6.4923 },
}

const UKStatesDropdown = ({ 
  value, 
  onChange, 
  placeholder = 'Select a state...', 
  required = false, 
  className = '' 
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      className={`input-field ${className}`}
    >
      <option value="">{placeholder}</option>
      {UK_STATES.map(state => (
        <option key={state.value} value={state.value}>
          {state.label}
        </option>
      ))}
    </select>
  )
}

export default UKStatesDropdown