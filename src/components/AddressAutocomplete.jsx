import React, { useState, useEffect, useRef } from 'react'
import { FaMapMarkerAlt, FaSpinner, FaTimes, FaSearch, FaCity, FaGlobe, FaLocationArrow } from 'react-icons/fa'
import UKStatesDropdown from './utils/UKStatesDropdown'

const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Search for an address...',
  label = 'Address',
  required = false,
  className = '',
  disabled = false,
  country = 'gb',
  minChars = 2,
  showFallback = true, // Show fallback options
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [fallbackMode, setFallbackMode] = useState(false)
  const [manualCoordinates, setManualCoordinates] = useState({ lat: '', lng: '' })
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const debounceTimer = useRef(null)

  // UK Cities/States for fallback
  const UK_CITIES = [
    'London', 'Manchester', 'Birmingham', 'Liverpool', 'Bristol',
    'Sheffield', 'Leeds', 'Newcastle', 'Nottingham', 'Southampton',
    'Brighton', 'Oxford', 'Cambridge', 'York', 'Bath',
    'Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Cardiff',
    'Swansea', 'Belfast', 'Derry', 'Reading', 'Milton Keynes',
    'St Albans', 'Chelmsford', 'Colchester', 'Peterborough', 'Norwich',
    'Leicester', 'Coventry', 'Stoke', 'Wolverhampton', 'Plymouth',
    'Exeter', 'Bournemouth', 'Portsmouth', 'Canterbury', 'Dover'
  ]

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update input when value prop changes
  useEffect(() => {
    if (value !== inputValue && !selectedAddress) {
      setInputValue(value || '')
    }
  }, [value])

  // Fetch address suggestions from multiple sources
  const fetchSuggestions = async (query) => {
    if (!query || query.length < minChars) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    setFallbackMode(false)
    
    try {
      let results = []

      // Try 1: Nominatim (Free, reliable for UK)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(query)}&` +
          `format=json&` +
          `addressdetails=1&` +
          `limit=15&` +
          `countrycodes=gb&` +
          `accept-language=en&` +
          `bounded=1&` +
          `viewbox=-10.0,60.0,2.0,49.0`
        )

        if (response.ok) {
          const data = await response.json()
          results = data
            .filter(item => {
              const isUK = item.display_name?.includes('United Kingdom') ||
                          item.display_name?.includes('UK') ||
                          item.address?.country_code === 'gb'
              return isUK
            })
            .map(item => ({
              displayName: item.display_name || '',
              lat: parseFloat(item.lat) || 0,
              lon: parseFloat(item.lon) || 0,
              address: item.address || {},
              importance: item.importance || 0,
              type: item.type || 'address',
              class: item.class || 'place',
              houseNumber: item.address?.house_number || '',
              road: item.address?.road || item.address?.street || '',
              suburb: item.address?.suburb || '',
              city: item.address?.city || item.address?.town || item.address?.village || '',
              county: item.address?.county || item.address?.state || '',
              postcode: item.address?.postcode || '',
              country: item.address?.country || 'United Kingdom',
              region: item.address?.region || '',
              source: 'nominatim'
            }))
        }
      } catch (e) {
        console.warn('Nominatim fetch failed:', e.message)
      }

      // Try 2: If Nominatim returns few results, use local UK city matching
      if (results.length < 3) {
        const lowerQuery = query.toLowerCase()
        const matchedCities = UK_CITIES
          .filter(city => city.toLowerCase().includes(lowerQuery))
          .map(city => ({
            displayName: `${city}, United Kingdom`,
            lat: 0, // Will be resolved
            lon: 0,
            address: { city: city, country: 'United Kingdom' },
            type: 'city',
            class: 'place',
            city: city,
            country: 'United Kingdom',
            source: 'fallback',
            isFallback: true
          }))
        
        results = [...results, ...matchedCities]
      }

      setSuggestions(results)
      setIsOpen(results.length > 0)

      // If no results, suggest fallback mode
      if (results.length === 0 && query.length >= 3) {
        setFallbackMode(true)
      }

    } catch (error) {
      console.error('Address suggestions error:', error)
      setSuggestions([])
      // Show fallback options
      if (query.length >= 3) {
        setFallbackMode(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced search
  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    setSelectedAddress(null)
    setFallbackMode(false)
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(val)
    }, 300)
  }

  // Handle selection of an address
  const handleSelect = (suggestion) => {
    const fullAddress = suggestion.displayName || 
                       (suggestion.city ? `${suggestion.city}, United Kingdom` : '')
    
    setInputValue(fullAddress)
    setSelectedAddress(suggestion)
    setSuggestions([])
    setIsOpen(false)
    setFallbackMode(false)
    
    if (onChange) {
      onChange({
        target: {
          name: 'address',
          value: fullAddress,
        }
      })
    }
    
    if (onSelect) {
      onSelect(suggestion)
    }
  }

  // Handle city selection from fallback
  const handleCitySelect = (city) => {
    const fullAddress = `${city}, United Kingdom`
    const suggestion = {
      displayName: fullAddress,
      lat: 0,
      lon: 0,
      address: { city: city, country: 'United Kingdom' },
      type: 'city',
      class: 'place',
      city: city,
      country: 'United Kingdom',
      source: 'fallback',
      isFallback: true
    }
    
    setInputValue(fullAddress)
    setSelectedAddress(suggestion)
    setSuggestions([])
    setIsOpen(false)
    setFallbackMode(false)
    
    if (onChange) {
      onChange({
        target: {
          name: 'address',
          value: fullAddress,
        }
      })
    }
    
    if (onSelect) {
      onSelect(suggestion)
    }
  }

  // Clear the input
  const handleClear = () => {
    setInputValue('')
    setSelectedAddress(null)
    setSuggestions([])
    setIsOpen(false)
    setFallbackMode(false)
    if (onChange) {
      onChange({
        target: {
          name: 'address',
          value: '',
        }
      })
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Get formatted address for display
  const getFormattedAddress = (suggestion) => {
    if (suggestion.isFallback) {
      return suggestion.city || suggestion.displayName
    }
    const parts = []
    if (suggestion.houseNumber) parts.push(suggestion.houseNumber)
    if (suggestion.road) parts.push(suggestion.road)
    if (suggestion.suburb) parts.push(suggestion.suburb)
    if (suggestion.city) parts.push(suggestion.city)
    if (suggestion.postcode) parts.push(suggestion.postcode)
    return parts.length > 0 ? parts.join(', ') : suggestion.displayName || 'Address'
  }

  const getAddressBadge = (suggestion) => {
    if (suggestion.isFallback) return 'City'
    if (suggestion.postcode) return 'Postcode'
    if (suggestion.city) return 'City'
    if (suggestion.suburb) return 'Area'
    if (suggestion.class === 'building') return 'Building'
    if (suggestion.class === 'amenity') return 'Landmark'
    return 'Address'
  }

  // Use current location as fallback
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const suggestion = {
            displayName: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            lat: latitude,
            lon: longitude,
            address: { country: 'United Kingdom' },
            type: 'location',
            class: 'place',
            isFallback: true,
            source: 'geolocation'
          }
          setInputValue(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`)
          setSelectedAddress(suggestion)
          setIsOpen(false)
          setFallbackMode(false)
          
          if (onSelect) {
            onSelect(suggestion)
          }
        },
        (error) => {
          console.warn('Geolocation failed:', error.message)
        }
      )
    }
  }

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-text-light mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter z-10">
          <FaMapMarkerAlt />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-10 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white"
          disabled={disabled}
          required={required}
          autoComplete="off"
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 z-10">
          {isLoading && (
            <FaSpinner className="animate-spin text-text-lighter" />
          )}
          {inputValue && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-text-lighter hover:text-text transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <FaTimes className="text-xs" />
            </button>
          )}
          <FaSearch className="text-text-lighter text-sm" />
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-large border border-gray-200 max-h-80 overflow-y-auto">
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white flex justify-between items-center">
            <p className="text-xs text-text-lighter">
              {suggestions.length} address{suggestions.length > 1 ? 'es' : ''} found
            </p>
            {fallbackMode && (
              <span className="text-xs text-amber-600">Using fallback</span>
            )}
          </div>
          {suggestions.map((suggestion, index) => {
            const displayAddress = getFormattedAddress(suggestion)
            const badge = getAddressBadge(suggestion)
            const isFallback = suggestion.isFallback
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex items-start space-x-3 ${isFallback ? 'bg-amber-50/50' : ''}`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isFallback ? (
                    <FaCity className="text-amber-500 text-sm" />
                  ) : (
                    <FaMapMarkerAlt className="text-primary text-sm" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm font-medium truncate ${isFallback ? 'text-amber-700' : 'text-text'}`}>
                      {displayAddress || 'Unnamed Address'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${isFallback ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-text-lighter'}`}>
                      {badge}
                    </span>
                  </div>
                  <p className="text-xs text-text-lighter truncate mt-0.5">
                    {suggestion.city || suggestion.county || suggestion.region || 'United Kingdom'}
                    {suggestion.postcode && ` • ${suggestion.postcode}`}
                    {isFallback && ' • Approximate location'}
                  </p>
                </div>
              </button>
            )
          })}
          
          {/* Use Current Location option */}
          <button
            type="button"
            onClick={useCurrentLocation}
            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-t border-gray-100 flex items-center space-x-3"
          >
            <FaLocationArrow className="text-blue-500 text-sm" />
            <span className="text-sm text-blue-600 font-medium">Use Current Location</span>
          </button>
        </div>
      )}

      {/* Fallback Mode - Show UK Cities */}
      {fallbackMode && !isOpen && inputValue.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-large border border-amber-200 max-h-60 overflow-y-auto">
          <div className="p-3 border-b border-amber-100 bg-amber-50/50">
            <div className="flex items-center space-x-2">
              <FaCity className="text-amber-500" />
              <p className="text-sm text-amber-700 font-medium">Can't find exact address? Try selecting a city:</p>
            </div>
            <p className="text-xs text-amber-600 mt-1">Distance will be calculated using city centre</p>
          </div>
          <div className="p-2">
            {UK_CITIES
              .filter(city => city.toLowerCase().includes(inputValue.toLowerCase()))
              .slice(0, 10)
              .map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className="w-full text-left px-3 py-2 hover:bg-amber-50 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <FaCity className="text-amber-400 text-sm" />
                  <div>
                    <p className="text-sm font-medium text-text">{city}</p>
                    <p className="text-xs text-text-lighter">United Kingdom</p>
                  </div>
                </button>
              ))}
            {UK_CITIES.filter(city => city.toLowerCase().includes(inputValue.toLowerCase())).length === 0 && (
              <p className="text-sm text-text-light p-3">No cities found. Try a different search.</p>
            )}
          </div>
          
          <button
            type="button"
            onClick={useCurrentLocation}
            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-t border-gray-100 flex items-center space-x-3"
          >
            <FaLocationArrow className="text-blue-500 text-sm" />
            <span className="text-sm text-blue-600 font-medium">Use Current Location</span>
          </button>
        </div>
      )}

      {/* Selected Address Preview */}
      {selectedAddress && (
        <div className={`mt-2 p-3 rounded-lg border ${selectedAddress.isFallback ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-start space-x-2">
            {selectedAddress.isFallback ? (
              <FaCity className="text-amber-600 mt-0.5 flex-shrink-0" />
            ) : (
              <FaCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${selectedAddress.isFallback ? 'text-amber-700' : 'text-green-700'}`}>
                {selectedAddress.isFallback ? 'Approximate Location' : 'Selected Address'}
              </p>
              <p className={`text-xs truncate ${selectedAddress.isFallback ? 'text-amber-600' : 'text-green-600'}`}>
                {selectedAddress.displayName || selectedAddress.city || 'Address selected'}
              </p>
              {selectedAddress.isFallback && (
                <p className="text-xs text-amber-500 mt-0.5">
                  ⚠️ Using approximate location (city centre)
                </p>
              )}
              {selectedAddress.postcode && (
                <p className="text-xs text-green-500 mt-0.5">Postcode: {selectedAddress.postcode}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Add missing import
import { FaCheckCircle } from 'react-icons/fa'

export default AddressAutocomplete