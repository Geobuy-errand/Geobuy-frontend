import React, { useState, useEffect, useRef } from 'react'
import { FaMapMarkerAlt, FaSpinner, FaTimes, FaSearch, FaCity, FaLocationArrow, FaCheckCircle } from 'react-icons/fa'
import useCountry from '../hooks/useCountry'
import { getCountry, normalizeCountry, isWithinCountry } from '../config/countries'
import { CITY_COORDINATES } from '../config/locations'

/**
 * Country-aware address search (UK + Nigeria).
 *
 * Suggestions come from OpenStreetMap (Nominatim) restricted to the country,
 * plus an instant local list of cities / areas (Lekki, Ikeja, Wuse, ...).
 *
 * onSelect(suggestion) receives:
 *   { displayName, lat, lon, lng, road, houseNumber, suburb, city, county,
 *     state, postcode, country, countryCode, isFallback }
 */
const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder,
  label = 'Address',
  required = false,
  className = '',
  disabled = false,
  country: countryProp, // 'GB' | 'NG' (also accepts legacy 'gb')
  minChars = 2,
}) => {
  const { code: userCountry } = useCountry()
  const code = normalizeCountry(countryProp || userCountry)
  const c = getCountry(code)
  const cities = CITY_COORDINATES[code] || {}

  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [geoError, setGeoError] = useState('')
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const debounceTimer = useRef(null)
  const isSelectingRef = useRef(false)
  const requestId = useRef(0)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isSelectingRef.current && value !== inputValue) setInputValue(value || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => () => debounceTimer.current && clearTimeout(debounceTimer.current), [])

  const localSuggestions = (query) => {
    const q = query.toLowerCase().trim()
    if (!q) return []
    return Object.entries(cities)
      .filter(([name, meta]) => name.toLowerCase().includes(q) || meta.state?.toLowerCase().includes(q))
      .sort(([a], [b]) => (a.toLowerCase().startsWith(q) ? -1 : 0) - (b.toLowerCase().startsWith(q) ? -1 : 0))
      .slice(0, 6)
      .map(([name, meta]) => ({
        displayName: meta.state ? `${name}, ${meta.state}, ${c.name}` : `${name}, ${c.name}`,
        lat: meta.lat,
        lon: meta.lng,
        lng: meta.lng,
        city: name,
        state: meta.state || '',
        county: meta.state || '',
        country: c.name,
        countryCode: code,
        type: 'city',
        isFallback: true,
      }))
  }

  const fetchSuggestions = async (query) => {
    if (!query || query.length < minChars) {
      setSuggestions([])
      setIsOpen(false)
      return
    }
    const id = ++requestId.current
    setIsLoading(true)
    let results = []
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3500)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}` +
          `&format=json&addressdetails=1&limit=5&countrycodes=${c.geocodeCountryCode}&accept-language=en`,
        { signal: controller.signal }
      )
      clearTimeout(timeoutId)
      if (response.ok) {
        const data = await response.json()
        results = data
          .filter((item) => isWithinCountry(parseFloat(item.lat), parseFloat(item.lon), code))
          .map((item) => {
            const a = item.address || {}
            return {
              displayName: item.display_name || '',
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              lng: parseFloat(item.lon),
              address: a,
              importance: item.importance || 0,
              type: item.type || 'address',
              class: item.class || 'place',
              houseNumber: a.house_number || '',
              road: a.road || a.street || '',
              suburb: a.suburb || a.neighbourhood || a.quarter || '',
              city: a.city || a.town || a.village || a.city_district || a.county || '',
              county: a.county || a.state_district || '',
              state: a.state || '',
              postcode: a.postcode || '',
              country: a.country || c.name,
              countryCode: code,
            }
          })
      }
    } catch {
      // Nominatim unavailable or slow — local list still works
    }

    if (id !== requestId.current) return // a newer search started

    const combined = [...results]
    for (const local of localSuggestions(query)) {
      if (!combined.some((r) => r.city && r.city.toLowerCase() === local.city.toLowerCase() && r.isFallback)) combined.push(local)
    }
    setSuggestions(combined)
    setIsOpen(combined.length > 0)
    setIsLoading(false)
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    setSelectedAddress(null)
    isSelectingRef.current = false
    onChange?.(val)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (val.length >= minChars) {
      // Local results instantly, OSM results after a short pause
      const local = localSuggestions(val)
      if (local.length) {
        setSuggestions(local)
        setIsOpen(true)
      }
      debounceTimer.current = setTimeout(() => fetchSuggestions(val), 400)
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
  }

  const handleSelect = (suggestion) => {
    const fullAddress = suggestion.displayName || inputValue
    isSelectingRef.current = true
    setInputValue(fullAddress)
    setSelectedAddress(suggestion)
    setSuggestions([])
    setIsOpen(false)
    onChange?.(fullAddress)
    onSelect?.(suggestion)
  }

  const handleClear = () => {
    setInputValue('')
    setSelectedAddress(null)
    setSuggestions([])
    setIsOpen(false)
    isSelectingRef.current = false
    onChange?.('')
    inputRef.current?.focus()
  }

  const useCurrentLocation = () => {
    setGeoError('')
    if (!navigator.geolocation) return setGeoError('Location is not available on this device')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        if (!isWithinCountry(latitude, longitude, code)) {
          setGeoError(`Your current location is outside ${c.name}`)
          return
        }
        let suggestion = {
          displayName: `Current location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          lat: latitude,
          lon: longitude,
          lng: longitude,
          country: c.name,
          countryCode: code,
          type: 'location',
          isFallback: false,
        }
        // Reverse-geocode for a readable address (best effort)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=en`
          )
          if (res.ok) {
            const data = await res.json()
            const a = data.address || {}
            suggestion = {
              ...suggestion,
              displayName: data.display_name || suggestion.displayName,
              road: a.road || '',
              houseNumber: a.house_number || '',
              suburb: a.suburb || a.neighbourhood || '',
              city: a.city || a.town || a.village || a.county || '',
              state: a.state || '',
              postcode: a.postcode || '',
            }
          }
        } catch {
          // keep coordinates-only suggestion
        }
        handleSelect(suggestion)
      },
      (error) => setGeoError(error.message || 'Could not get your location')
    )
  }

  const formatted = (s) => {
    if (s.isFallback) return s.city || s.displayName
    const parts = [s.houseNumber, s.road, s.suburb, s.city, s.state, s.postcode].filter(Boolean)
    return parts.length ? [...new Set(parts)].join(', ') : s.displayName || 'Address'
  }

  const badge = (s) => {
    if (s.isFallback) return code === 'NG' ? 'Area' : 'City'
    if (s.road) return 'Street'
    if (s.postcode) return 'Postcode'
    if (s.suburb) return 'Area'
    if (s.class === 'amenity' || s.class === 'shop') return 'Landmark'
    return 'Address'
  }

  const defaultPlaceholder =
    code === 'NG' ? 'Street, area or landmark (e.g. Admiralty Way, Lekki)' : 'Street, postcode or place (e.g. SW1A 1AA)'

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
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder || defaultPlaceholder}
          className="w-full px-4 py-3 pl-10 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white"
          disabled={disabled}
          required={required}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 z-10">
          {isLoading && <FaSpinner className="animate-spin text-text-lighter" />}
          {inputValue && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear address"
              className="text-text-lighter hover:text-text transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <FaTimes className="text-xs" />
            </button>
          )}
          <FaSearch className="text-text-lighter text-sm" />
        </div>
      </div>

      {!isOpen && !selectedAddress && !disabled && (
        <button type="button" onClick={useCurrentLocation} className="mt-1 text-xs text-primary hover:underline flex items-center gap-1">
          <FaLocationArrow className="text-[10px]" /> Use my current location
        </button>
      )}
      {geoError && <p className="text-xs text-red-500 mt-1">{geoError}</p>}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-large border border-gray-200 max-h-72 overflow-y-auto">
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white flex justify-between items-center">
            <p className="text-xs text-text-lighter">
              {suggestions.length} location{suggestions.length > 1 ? 's' : ''} in {c.name}
            </p>
          </div>
          {suggestions.map((s, index) => (
            <button
              key={`${s.displayName}-${index}`}
              type="button"
              onClick={() => handleSelect(s)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex items-start space-x-3 ${
                s.isFallback ? 'bg-amber-50/30' : ''
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {s.isFallback ? <FaCity className="text-amber-400 text-sm" /> : <FaMapMarkerAlt className="text-primary text-sm" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className={`text-sm font-medium truncate ${s.isFallback ? 'text-amber-700' : 'text-text'}`}>{formatted(s)}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      s.isFallback ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-text-lighter'
                    }`}
                  >
                    {badge(s)}
                  </span>
                </div>
                <p className="text-xs text-text-lighter truncate mt-0.5">
                  {[s.state || s.county, c.name].filter(Boolean).join(', ')}
                  {s.isFallback && ' • area centre — add your street for an exact price'}
                </p>
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={useCurrentLocation}
            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-t border-gray-100 flex items-center space-x-3"
          >
            <FaLocationArrow className="text-blue-500 text-sm" />
            <span className="text-sm text-blue-600 font-medium">Use current location</span>
          </button>
        </div>
      )}

      {selectedAddress && (
        <div
          className={`mt-2 p-3 rounded-lg border ${
            selectedAddress.isFallback ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex items-start space-x-2">
            {selectedAddress.isFallback ? (
              <FaCity className="text-amber-600 mt-0.5 flex-shrink-0" />
            ) : (
              <FaCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${selectedAddress.isFallback ? 'text-amber-700' : 'text-green-700'}`}>
                {selectedAddress.isFallback ? 'Area selected' : 'Address selected'}
              </p>
              <p className={`text-xs truncate ${selectedAddress.isFallback ? 'text-amber-600' : 'text-green-600'}`}>
                {selectedAddress.displayName}
              </p>
              {selectedAddress.isFallback && (
                <p className="text-xs text-amber-500 mt-0.5">Using the area centre. Add your street for an exact distance.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressAutocomplete
