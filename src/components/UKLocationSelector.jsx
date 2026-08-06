import React, { useState, useEffect } from 'react'
import { FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa'

const UKLocationSelector = ({ 
  value, 
  onChange, 
  onSelect,
  label = 'Location',
  required = false,
  className = '',
}) => {
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [isValid, setIsValid] = useState(false)

  // UK Regions
  const regions = [
    { id: 'england', label: 'England' },
    { id: 'scotland', label: 'Scotland' },
    { id: 'wales', label: 'Wales' },
    { id: 'northern_ireland', label: 'Northern Ireland' },
  ]

  // UK Counties by Region
  const counties = {
    england: [
      { id: 'greater_london', label: 'Greater London' },
      { id: 'kent', label: 'Kent' },
      { id: 'essex', label: 'Essex' },
      { id: 'surrey', label: 'Surrey' },
      { id: 'hampshire', label: 'Hampshire' },
      { id: 'greater_manchester', label: 'Greater Manchester' },
      { id: 'merseyside', label: 'Merseyside' },
      { id: 'west_midlands', label: 'West Midlands' },
      { id: 'yorkshire', label: 'Yorkshire' },
      { id: 'lancashire', label: 'Lancashire' },
      { id: 'bristol', label: 'Bristol' },
      { id: 'cambridgeshire', label: 'Cambridgeshire' },
      { id: 'devon', label: 'Devon' },
      { id: 'norfolk', label: 'Norfolk' },
      { id: 'oxfordshire', label: 'Oxfordshire' },
    ],
    scotland: [
      { id: 'edinburgh', label: 'Edinburgh' },
      { id: 'glasgow', label: 'Glasgow' },
      { id: 'aberdeen', label: 'Aberdeen' },
      { id: 'dundee', label: 'Dundee' },
      { id: 'inverness', label: 'Inverness' },
    ],
    wales: [
      { id: 'cardiff', label: 'Cardiff' },
      { id: 'swansea', label: 'Swansea' },
      { id: 'newport', label: 'Newport' },
      { id: 'bangor', label: 'Bangor' },
    ],
    northern_ireland: [
      { id: 'belfast', label: 'Belfast' },
      { id: 'derry', label: 'Derry/Londonderry' },
      { id: 'lisburn', label: 'Lisburn' },
    ],
  }

  // Major UK Cities by County
  const cities = {
    greater_london: ['London', 'Westminster', 'Camden', 'Islington', 'Southwark', 'Lambeth'],
    kent: ['Canterbury', 'Maidstone', 'Dover', 'Folkestone', 'Ashford'],
    essex: ['Chelmsford', 'Colchester', 'Southend', 'Basildon'],
    surrey: ['Guildford', 'Woking', 'Epsom', 'Redhill'],
    hampshire: ['Southampton', 'Portsmouth', 'Winchester', 'Basingstoke'],
    greater_manchester: ['Manchester', 'Salford', 'Bolton', 'Oldham'],
    merseyside: ['Liverpool', 'Birkenhead', 'St Helens'],
    west_midlands: ['Birmingham', 'Wolverhampton', 'Coventry', 'Walsall'],
    yorkshire: ['Leeds', 'Sheffield', 'Bradford', 'York', 'Hull'],
    edinburgh: ['Edinburgh'],
    glasgow: ['Glasgow'],
    cardiff: ['Cardiff'],
    swansea: ['Swansea'],
    belfast: ['Belfast'],
  }

  const getCountiesForRegion = (regionId) => {
    return counties[regionId] || []
  }

  const getCitiesForCounty = (countyId) => {
    return cities[countyId] || []
  }

  const handleRegionChange = (e) => {
    const region = e.target.value
    setSelectedRegion(region)
    setSelectedCounty('')
    setSelectedCity('')
    validateAddress()
  }

  const handleCountyChange = (e) => {
    const county = e.target.value
    setSelectedCounty(county)
    setSelectedCity('')
    validateAddress()
  }

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value)
    validateAddress()
  }

  const validateAddress = () => {
    const hasStreet = streetAddress.trim().length > 0
    const hasCity = selectedCity.length > 0
    const hasCounty = selectedCounty.length > 0
    const hasRegion = selectedRegion.length > 0
    
    const valid = hasStreet && hasCity && hasCounty && hasRegion
    setIsValid(valid)
    
    if (valid && onSelect) {
      const fullAddress = `${streetAddress}, ${selectedCity}, ${selectedCounty}, ${selectedRegion}, United Kingdom`
      onSelect({
        displayName: fullAddress,
        street: streetAddress,
        city: selectedCity,
        county: selectedCounty,
        region: selectedRegion,
        postcode: postcode || '',
        country: 'United Kingdom',
      })
    }
  }

  useEffect(() => {
    validateAddress()
  }, [streetAddress, selectedCity, selectedCounty, selectedRegion, postcode])

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-light">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Street Address */}
      <div>
        <label className="block text-sm font-medium text-text-light mb-1">
          Street Address *
        </label>
        <div className="relative">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            value={streetAddress}
            onChange={(e) => {
              setStreetAddress(e.target.value)
              validateAddress()
            }}
            placeholder="e.g., 10 Downing Street"
            className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white"
            required={required}
          />
        </div>
      </div>

      {/* Region Dropdown */}
      <div>
        <label className="block text-sm font-medium text-text-light mb-1">
          Region *
        </label>
        <select
          value={selectedRegion}
          onChange={handleRegionChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white"
          required={required}
        >
          <option value="">Select Region...</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.label}
            </option>
          ))}
        </select>
      </div>

      {/* County Dropdown */}
      {selectedRegion && (
        <div>
          <label className="block text-sm font-medium text-text-light mb-1">
            County *
          </label>
          <select
            value={selectedCounty}
            onChange={handleCountyChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white"
            required={required}
          >
            <option value="">Select County...</option>
            {getCountiesForRegion(selectedRegion).map((county) => (
              <option key={county.id} value={county.id}>
                {county.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* City Dropdown */}
      {selectedCounty && getCitiesForCounty(selectedCounty).length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-light mb-1">
            City/Town *
          </label>
          <select
            value={selectedCity}
            onChange={handleCityChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white"
            required={required}
          >
            <option value="">Select City/Town...</option>
            {getCitiesForCounty(selectedCounty).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Postcode */}
      <div>
        <label className="block text-sm font-medium text-text-light mb-1">
          Postcode (Optional)
        </label>
        <input
          type="text"
          value={postcode}
          onChange={(e) => {
            setPostcode(e.target.value.toUpperCase())
            validateAddress()
          }}
          placeholder="e.g., SW1A 1AA"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white uppercase"
        />
      </div>

      {/* Validation Status */}
      {isValid && (
        <div className="flex items-center text-green-600 text-sm">
          <FaCheckCircle className="mr-2" />
          <span>Address complete and valid</span>
        </div>
      )}

      {/* Selected Address Preview */}
      {isValid && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">Selected Address</p>
          <p className="text-xs text-green-600">
            {streetAddress}, {selectedCity}, {selectedCounty}, {selectedRegion}, United Kingdom
            {postcode && `, ${postcode}`}
          </p>
        </div>
      )}
    </div>
  )
}

export default UKLocationSelector