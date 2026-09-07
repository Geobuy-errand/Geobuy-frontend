import React, { useState, useEffect, useRef } from 'react'
import { FaMapMarkerAlt, FaSpinner, FaTimes, FaSearch, FaCity, FaLocationArrow } from 'react-icons/fa'
import { FaCheckCircle } from 'react-icons/fa'

// UK City Coordinates for fallback
const UK_CITY_COORDINATES = {
  london: { lat: 51.5074, lng: -0.1278 },
  manchester: { lat: 53.4808, lng: -2.2426 },
  birmingham: { lat: 52.4862, lng: -1.8904 },
  liverpool: { lat: 53.4084, lng: -2.9916 },
  bristol: { lat: 51.4545, lng: -2.5879 },
  sheffield: { lat: 53.3811, lng: -1.4701 },
  leeds: { lat: 53.8008, lng: -1.5491 },
  newcastle: { lat: 54.9783, lng: -1.6174 },
  nottingham: { lat: 52.9548, lng: -1.1581 },
  southampton: { lat: 50.9097, lng: -1.4044 },
  brighton: { lat: 50.8225, lng: -0.1372 },
  oxford: { lat: 51.7520, lng: -1.2577 },
  cambridge: { lat: 52.2053, lng: 0.1218 },
  york: { lat: 53.9600, lng: -1.0873 },
  bath: { lat: 51.3758, lng: -2.3599 },
  edinburgh: { lat: 55.9533, lng: -3.1883 },
  glasgow: { lat: 55.8642, lng: -4.2518 },
  aberdeen: { lat: 57.1497, lng: -2.0943 },
  dundee: { lat: 56.4620, lng: -2.9707 },
  cardiff: { lat: 51.4816, lng: -3.1791 },
  swansea: { lat: 51.6214, lng: -3.9436 },
  belfast: { lat: 54.5973, lng: -5.9301 },
  derry: { lat: 54.9966, lng: -7.3086 },
  reading: { lat: 51.4543, lng: -0.9781 },
}

// Expanded UK Cities for better matching
const UK_CITIES = [
  'London', 'Manchester', 'Birmingham', 'Liverpool', 'Bristol',
  'Sheffield', 'Leeds', 'Newcastle', 'Nottingham', 'Southampton',
  'Brighton', 'Oxford', 'Cambridge', 'York', 'Bath',
  'Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Cardiff',
  'Swansea', 'Belfast', 'Derry', 'Reading', 'Milton Keynes',
  'Leicester', 'Coventry', 'Stoke', 'Wolverhampton', 'Plymouth',
  'Exeter', 'Bournemouth', 'Portsmouth', 'Canterbury', 'Dover',
  'Norwich', 'Peterborough', 'Chelmsford', 'Colchester', 'St Albans'
]

// City aliases for better matching
const CITY_ALIASES = {
  london: ['london', 'greater london', 'city of london'],
  manchester: ['manchester', 'greater manchester'],
  birmingham: ['birmingham', 'brum', 'west midlands'],
  liverpool: ['liverpool', 'merseyside'],
  leeds: ['leeds', 'west yorkshire'],
  sheffield: ['sheffield', 'south yorkshire'],
  bristol: ['bristol', 'avon'],
  newcastle: ['newcastle', 'newcastle upon tyne', 'tyne and wear'],
  nottingham: ['nottingham', 'nottinghamshire'],
  southampton: ['southampton', 'hampshire'],
  brighton: ['brighton', 'brighton and hove'],
  oxford: ['oxford', 'oxfordshire'],
  cambridge: ['cambridge', 'cambridgeshire'],
  york: ['york', 'north yorkshire'],
  bath: ['bath', 'somerset'],
  edinburgh: ['edinburgh', 'midlothian'],
  glasgow: ['glasgow', 'strathclyde'],
  cardiff: ['cardiff', 'south glamorgan'],
  swansea: ['swansea', 'west glamorgan'],
  belfast: ['belfast', 'county antrim'],
  reading: ['reading', 'berkshire'],
}

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
  minChars = 1, // ✅ Changed to 1 for better UX
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const [selectedAddress, setSelectedAddress] = useState(null)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const debounceTimer = useRef(null)
  const isSelectingRef = useRef(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isSelectingRef.current && value !== inputValue) {
      setInputValue(value || '')
    }
  }, [value])

  // ✅ Get city suggestions from local database (instant, no API call)
  const getLocalCitySuggestions = (query) => {
    const lowerQuery = query.toLowerCase().trim()
    if (!lowerQuery) return []

    const results = []
    
    // First try exact matches
    for (const city of UK_CITIES) {
      if (city.toLowerCase() === lowerQuery) {
        results.push(city)
      }
    }
    
    // Then try partial matches
    for (const city of UK_CITIES) {
      if (city.toLowerCase().includes(lowerQuery) && !results.includes(city)) {
        results.push(city)
      }
    }
    
    // Then try alias matches
    for (const [cityKey, aliases] of Object.entries(CITY_ALIASES)) {
      for (const alias of aliases) {
        if (alias.includes(lowerQuery) || lowerQuery.includes(alias)) {
          const cityName = cityKey.charAt(0).toUpperCase() + cityKey.slice(1)
          if (!results.includes(cityName)) {
            results.push(cityName)
          }
        }
      }
    }
    
    return results.slice(0, 10) // Limit to 10 results
  }

  // ✅ Build suggestion objects from city names
  const buildSuggestions = (cityNames) => {
    return cityNames.map(city => {
      const cityKey = city.toLowerCase()
      const coords = UK_CITY_COORDINATES[cityKey]
      return {
        displayName: `${city}, United Kingdom`,
        lat: coords?.lat || 51.5074,
        lon: coords?.lng || -0.1278,
        address: { city: city, country: 'United Kingdom' },
        type: 'city',
        class: 'place',
        city: city,
        country: 'United Kingdom',
        isFallback: true
      }
    })
  }

  const fetchSuggestions = async (query) => {
    if (!query || query.length < minChars) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    
    try {
      let results = []

      // ✅ Try Nominatim with timeout - but don't rely on it
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(query)}&` +
          `format=json&` +
          `addressdetails=1&` +
          `limit=3&` +
          `countrycodes=gb&` +
          `accept-language=en`,
          { signal: controller.signal }
        )
        
        clearTimeout(timeoutId)
        
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
            }))
        }
      } catch (e) {
        console.warn('Nominatim fetch failed, using local database:', e.message)
      }

      // ✅ ALWAYS get local city suggestions (instant, no API call)
      const localCities = getLocalCitySuggestions(query)
      const localSuggestions = buildSuggestions(localCities)
      
      // ✅ Combine results: Nominatim first, then local cities
      // Filter out duplicates by displayName
      const combinedResults = [...results]
      for (const localSuggestion of localSuggestions) {
        const exists = combinedResults.some(r => 
          r.displayName === localSuggestion.displayName ||
          (r.city && localSuggestion.city && r.city.toLowerCase() === localSuggestion.city.toLowerCase())
        )
        if (!exists) {
          combinedResults.push(localSuggestion)
        }
      }

      setSuggestions(combinedResults)
      setIsOpen(combinedResults.length > 0)
    } catch (error) {
      console.warn('Address search error:', error)
      
      // ✅ Even if everything fails, show local city suggestions
      const localCities = getLocalCitySuggestions(query)
      const localSuggestions = buildSuggestions(localCities)
      setSuggestions(localSuggestions)
      setIsOpen(localSuggestions.length > 0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    setSelectedAddress(null)
    isSelectingRef.current = false
    
    if (onChange) {
      onChange(val)
    }
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // ✅ Show suggestions immediately for local matches
    if (val.length >= minChars) {
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(val)
      }, 150) // Faster response
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
  }

  const handleSelect = (suggestion) => {
    const fullAddress = suggestion.displayName || 
                       (suggestion.city ? `${suggestion.city}, United Kingdom` : inputValue)
    
    isSelectingRef.current = true
    setInputValue(fullAddress)
    setSelectedAddress(suggestion)
    setSuggestions([])
    setIsOpen(false)
    
    if (onChange) {
      onChange(fullAddress)
    }
    
    if (onSelect) {
      onSelect(suggestion)
    }
  }

  const handleClear = () => {
    setInputValue('')
    setSelectedAddress(null)
    setSuggestions([])
    setIsOpen(false)
    isSelectingRef.current = false
    
    if (onChange) {
      onChange('')
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

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
            isFallback: true
          }
          isSelectingRef.current = true
          setInputValue(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`)
          setSelectedAddress(suggestion)
          setIsOpen(false)
          
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
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white flex justify-between items-center">
            <p className="text-xs text-text-lighter">
              {suggestions.length} location{suggestions.length > 1 ? 's' : ''} found
            </p>
            {suggestions.some(s => s.isFallback) && (
              <span className="text-xs text-amber-600">📍 UK Cities</span>
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
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex items-start space-x-3 ${isFallback ? 'bg-amber-50/30' : ''}`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isFallback ? (
                    <FaCity className="text-amber-400 text-sm" />
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
                    {isFallback && ' • City centre'}
                  </p>
                  {isFallback && (
                    <p className="text-[10px] text-amber-500 mt-0.5">
                      ⚠️ Using city centre (UK database)
                    </p>
                  )}
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
                {selectedAddress.isFallback ? '📍 City Selected' : '✅ Address Selected'}
              </p>
              <p className={`text-xs truncate ${selectedAddress.isFallback ? 'text-amber-600' : 'text-green-600'}`}>
                {selectedAddress.displayName || selectedAddress.city || 'Address selected'}
              </p>
              {selectedAddress.isFallback && (
                <p className="text-xs text-amber-500 mt-0.5">
                  Using city centre from UK database
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

export default AddressAutocomplete