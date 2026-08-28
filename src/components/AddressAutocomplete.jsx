import React, { useState, useEffect, useRef } from 'react'
import { FaMapMarkerAlt, FaSpinner, FaTimes, FaSearch } from 'react-icons/fa'

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
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const [selectedAddress, setSelectedAddress] = useState(null)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const debounceTimer = useRef(null)

  // UK hierarchy
  const UK_REGIONS = [
    { id: 'england', label: 'England' },
    { id: 'scotland', label: 'Scotland' },
    { id: 'wales', label: 'Wales' },
    { id: 'northern_ireland', label: 'Northern Ireland' },
  ]

  const UK_COUNTIES = [
    // England
    { id: 'greater_london', label: 'Greater London', region: 'england' },
    { id: 'kent', label: 'Kent', region: 'england' },
    { id: 'essex', label: 'Essex', region: 'england' },
    { id: 'surrey', label: 'Surrey', region: 'england' },
    { id: 'hampshire', label: 'Hampshire', region: 'england' },
    { id: 'manchester', label: 'Greater Manchester', region: 'england' },
    { id: 'merseyside', label: 'Merseyside', region: 'england' },
    { id: 'west_midlands', label: 'West Midlands', region: 'england' },
    { id: 'yorkshire', label: 'Yorkshire', region: 'england' },
    // Scotland
    { id: 'edinburgh', label: 'Edinburgh', region: 'scotland' },
    { id: 'glasgow', label: 'Glasgow', region: 'scotland' },
    // Wales
    { id: 'cardiff', label: 'Cardiff', region: 'wales' },
    { id: 'swansea', label: 'Swansea', region: 'wales' },
    // Northern Ireland
    { id: 'belfast', label: 'Belfast', region: 'northern_ireland' },
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
    if (value !== inputValue) {
      setInputValue(value || '')
    }
  }, [value])

  // Fetch address suggestions from Nominatim with UK prioritization
  const fetchSuggestions = async (query) => {
    if (!query || query.length < minChars) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      // Search with UK bias and structured results
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=15&` +
        `countrycodes=gb&` +
        `accept-language=en&` +
        `bounded=1&` +
        `viewbox=-10.0,60.0,2.0,49.0` // UK bounding box
      )
      console.log({response})

      if (!response.ok) throw new Error('Failed to fetch suggestions')

      const data = await response.json()
      
      const formattedSuggestions = data
        .filter(item => {
          // Filter to ensure it's a UK address
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
          // Structured address components
          houseNumber: item.address?.house_number || '',
          road: item.address?.road || item.address?.street || '',
          suburb: item.address?.suburb || '',
          city: item.address?.city || item.address?.town || item.address?.village || '',
          county: item.address?.county || item.address?.state || '',
          postcode: item.address?.postcode || '',
          country: item.address?.country || 'United Kingdom',
          region: item.address?.region || '',
        }))

      setSuggestions(formattedSuggestions)
      setIsOpen(formattedSuggestions.length > 0)
    } catch (error) {
      console.error('Address suggestions error:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced search
  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    setSelectedAddress(null)
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(val)
    }, 300)
  }

  // Handle selection of an address
  const handleSelect = (suggestion) => {
    const fullAddress = suggestion.displayName || suggestion.address?.road || ''
    setInputValue(fullAddress)
    setSelectedAddress(suggestion)
    setSuggestions([])
    setIsOpen(false)
    
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
    const parts = []
    if (suggestion.houseNumber) parts.push(suggestion.houseNumber)
    if (suggestion.road) parts.push(suggestion.road)
    if (suggestion.suburb) parts.push(suggestion.suburb)
    if (suggestion.city) parts.push(suggestion.city)
    if (suggestion.postcode) parts.push(suggestion.postcode)
    return parts.length > 0 ? parts.join(', ') : suggestion.displayName || 'Address'
  }

  const getAddressBadge = (suggestion) => {
    if (suggestion.postcode) return 'Postcode'
    if (suggestion.city) return 'City'
    if (suggestion.suburb) return 'Area'
    if (suggestion.class === 'building') return 'Building'
    if (suggestion.class === 'amenity') return 'Landmark'
    return 'Address'
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
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-large border border-gray-200 max-h-72 overflow-y-auto">
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
            <p className="text-xs text-text-lighter">
              {suggestions.length} address{suggestions.length > 1 ? 'es' : ''} found in UK
            </p>
          </div>
          {suggestions.map((suggestion, index) => {
            const displayAddress = getFormattedAddress(suggestion)
            const badge = getAddressBadge(suggestion)
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex items-start space-x-3"
              >
                <div className="mt-0.5 flex-shrink-0">
                  <FaMapMarkerAlt className="text-primary text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-text truncate">
                      {displayAddress || 'Unnamed Address'}
                    </p>
                    <span className="text-xs bg-gray-100 text-text-lighter px-2 py-0.5 rounded-full flex-shrink-0">
                      {badge}
                    </span>
                  </div>
                  <p className="text-xs text-text-lighter truncate mt-0.5">
                    {suggestion.city || suggestion.county || suggestion.region || 'United Kingdom'}
                    {suggestion.postcode && ` • ${suggestion.postcode}`}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Selected Address Preview */}
      {selectedAddress && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <FaCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-green-700 font-medium">Selected Address</p>
              <p className="text-xs text-green-600 truncate">{selectedAddress.displayName || selectedAddress.address?.road || 'Address selected'}</p>
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