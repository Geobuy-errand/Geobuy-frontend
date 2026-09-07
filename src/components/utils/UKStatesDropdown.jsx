import React from 'react'

export const UK_STATES = [
  // Regions
  // { value: 'england', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England' },
  // { value: 'scotland', label: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland' },
  // { value: 'wales', label: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales' },
  // { value: 'northern_ireland', label: '🇮🇪 Northern Ireland' },
  
  // Major Cities
  { value: 'london', label: '📍 London' },
  { value: 'manchester', label: '📍 Manchester' },
  { value: 'birmingham', label: '📍 Birmingham' },
  { value: 'liverpool', label: '📍 Liverpool' },
  { value: 'bristol', label: '📍 Bristol' },
  { value: 'sheffield', label: '📍 Sheffield' },
  { value: 'leeds', label: '📍 Leeds' },
  { value: 'newcastle', label: '📍 Newcastle upon Tyne' },
  { value: 'nottingham', label: '📍 Nottingham' },
  { value: 'southampton', label: '📍 Southampton' },
  { value: 'brighton', label: '📍 Brighton' },
  { value: 'oxford', label: '📍 Oxford' },
  { value: 'cambridge', label: '📍 Cambridge' },
  { value: 'york', label: '📍 York' },
  { value: 'bath', label: '📍 Bath' },
  { value: 'edinburgh', label: '📍 Edinburgh' },
  { value: 'glasgow', label: '📍 Glasgow' },
  { value: 'aberdeen', label: '📍 Aberdeen' },
  { value: 'dundee', label: '📍 Dundee' },
  { value: 'cardiff', label: '📍 Cardiff' },
  { value: 'swansea', label: '📍 Swansea' },
  { value: 'belfast', label: '📍 Belfast' },
  { value: 'derry', label: '📍 Derry' },
  { value: 'reading', label: '📍 Reading' },
  { value: 'leicester', label: '📍 Leicester' },
  { value: 'coventry', label: '📍 Coventry' },
  { value: 'stoke', label: '📍 Stoke-on-Trent' },
  { value: 'wolverhampton', label: '📍 Wolverhampton' },
  { value: 'plymouth', label: '📍 Plymouth' },
  { value: 'exeter', label: '📍 Exeter' },
  { value: 'bournemouth', label: '📍 Bournemouth' },
  { value: 'portsmouth', label: '📍 Portsmouth' },
  { value: 'norwich', label: '📍 Norwich' },
  { value: 'peterborough', label: '📍 Peterborough' },
  { value: 'chelmsford', label: '📍 Chelmsford' },
  { value: 'colchester', label: '📍 Colchester' },
  { value: 'st_albans', label: '📍 St Albans' },
  // { value: 'all_uk', label: '🌍 All UK' },
]

const UKStatesDropdown = ({ 
  value, 
  onChange, 
  placeholder = 'Select your state or city...', 
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