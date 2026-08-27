import React from 'react'

const UK_STATES = [
  'England',
  'Scotland', 
  'Wales',
  'Northern Ireland',
  'London',
  'Manchester',
  'Birmingham',
  'Liverpool',
  'Bristol',
  'Sheffield',
  'Leeds',
  'Newcastle',
  'Nottingham',
  'Southampton',
  'Brighton',
  'Oxford',
  'Cambridge',
  'York',
  'Bath',
  'Edinburgh',
  'Glasgow',
  'Aberdeen',
  'Dundee',
  'Cardiff',
  'Swansea',
  'Belfast',
  'Derry',
  'All UK'
]

const UKStatesDropdown = ({ value, onChange, placeholder = 'Select your state...', required = false, className = '' }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      className={`input-field ${className}`}
    >
      <option value="">{placeholder}</option>
      {UK_STATES.map(state => (
        <option key={state} value={state}>
          {state}
        </option>
      ))}
    </select>
  )
}

export default UKStatesDropdown