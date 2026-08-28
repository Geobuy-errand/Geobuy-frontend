import React from 'react'

export const UK_CITIES = [
  // Major Cities
  { value: 'aberdeen', label: 'Aberdeen' },
  { value: 'bath', label: 'Bath' },
  { value: 'belfast', label: 'Belfast' },
  { value: 'birmingham', label: 'Birmingham' },
  { value: 'brighton', label: 'Brighton' },
  { value: 'bristol', label: 'Bristol' },
  { value: 'cambridge', label: 'Cambridge' },
  { value: 'cardiff', label: 'Cardiff' },
  { value: 'derry', label: 'Derry' },
  { value: 'dundee', label: 'Dundee' },
  { value: 'edinburgh', label: 'Edinburgh' },
  { value: 'glasgow', label: 'Glasgow' },
  { value: 'leeds', label: 'Leeds' },
  { value: 'leicester', label: 'Leicester' },
  { value: 'liverpool', label: 'Liverpool' },
  { value: 'london', label: 'London' },
  { value: 'manchester', label: 'Manchester' },
  { value: 'newcastle', label: 'Newcastle upon Tyne' },
  { value: 'norwich', label: 'Norwich' },
  { value: 'nottingham', label: 'Nottingham' },
  { value: 'oxford', label: 'Oxford' },
  { value: 'plymouth', label: 'Plymouth' },
  { value: 'portsmouth', label: 'Portsmouth' },
  { value: 'sheffield', label: 'Sheffield' },
  { value: 'southampton', label: 'Southampton' },
  { value: 'swansea', label: 'Swansea' },
  { value: 'york', label: 'York' },
]

const UKCitiesDropdown = ({ 
  value, 
  onChange, 
  placeholder = 'Select a city...', 
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
      {UK_CITIES.map(city => (
        <option key={city.value} value={city.value}>
          {city.label}
        </option>
      ))}
    </select>
  )
}

export default UKCitiesDropdown