import React, { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { FaMapMarkerAlt, FaSpinner, FaTimes, FaSearch, FaCity, FaLocationArrow, FaCheckCircle, FaMapPin } from 'react-icons/fa'
import useCountry from '../hooks/useCountry'
import { getCountry, normalizeCountry, isWithinCountry } from '../config/countries'
import { CITY_COORDINATES } from '../config/locations'
import { getDevicePosition } from '../utils/geolocation'
import { searchAddresses, placeDetails, reverseGeocode } from '../services/geoApi'

// The map is only downloaded when someone opens it
const MapPinPicker = lazy(() => import('./MapPinPicker'))

/**
 * Country-aware address search (UK + Nigeria).
 *
 * Suggestions come from the Geobuy backend (/api/geo/search): Google Places
 * when a key is configured, otherwise OpenStreetMap (Photon), plus a built-in
 * list of towns/areas. If nothing fits, the user can "Set on map" and drop a
 * pin, so there is always a way to give an exact location.
 *
 * mapRequest: bump this number to open the map from outside (e.g. after a
 *             failed quote).
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
  mapRequest = 0,
  mapTitle,
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
  const [geoNote, setGeoNote] = useState('')
  const [locating, setLocating] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [mapStart, setMapStart] = useState(null)
  const [loadingPlace, setLoadingPlace] = useState(false)
  const [blurred, setBlurred] = useState(false)
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
      const near = selectedAddress?.lat != null ? { lat: selectedAddress.lat, lng: selectedAddress.lng } : undefined
      results = (await searchAddresses(query, { country: code, near })).map((r) => ({
        ...r,
        lon: r.lng,
        country: c.name,
        countryCode: code,
        type: r.provider === 'local' ? 'city' : 'address',
        isFallback: r.provider === 'local' || r.precision === 'town',
      }))
    } catch {
      // backend unreachable — local list still works
    }

    if (id !== requestId.current) return // a newer search started

    const combined = [...results]
    for (const local of localSuggestions(query)) {
      if (!combined.some((r) => (r.label || r.city || '').toLowerCase() === local.city.toLowerCase())) combined.push(local)
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

  const handleSelect = async (picked) => {
    let suggestion = picked
    // Google suggestions carry no coordinates until we ask for the place
    if (picked.needsDetails && picked.id) {
      setLoadingPlace(true)
      try {
        const d = await placeDetails(picked.id)
        suggestion = { ...picked, ...d, lon: d.lng, needsDetails: false, country: c.name, countryCode: code }
      } catch {
        setLoadingPlace(false)
        setGeoError("We couldn't load that place. Choose another suggestion or set it on the map.")
        return
      }
      setLoadingPlace(false)
    }
    setGeoError('')
    setBlurred(false)
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

  const useCurrentLocation = async () => {
    if (locating) return
    setGeoError('')
    setGeoNote('')
    setLocating(true)
    let position
    try {
      position = await getDevicePosition()
    } catch (error) {
      setLocating(false)
      setGeoError(error.message)
      return
    }
    try {
      const latitude = position.lat
      const longitude = position.lng
      if (!isWithinCountry(latitude, longitude, code)) {
        setGeoError(`Your current location is outside ${c.name}. Please type the address instead.`)
        return
      }
      // Wi-Fi/network fixes on laptops can be a few km out — prices are
      // distance-based, so ask the user to check.
      if (position.accuracy > 1000) {
        setGeoNote(`Location is approximate (within about ${Math.round(position.accuracy / 1000)} km). Please check the address, or type it for an exact price.`)
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
        const data = await reverseGeocode(latitude, longitude, code)
        if (data) {
          suggestion = {
            ...suggestion,
            displayName: data.displayName || suggestion.displayName,
            road: data.road || '',
            houseNumber: data.houseNumber || '',
            suburb: data.suburb || '',
            city: data.city || '',
            state: data.state || '',
            postcode: data.postcode || '',
          }
        }
      } catch {
        // keep coordinates-only suggestion
      }
      handleSelect(suggestion)
    } finally {
      setLocating(false)
    }
  }

  // Open the map near what the user typed (or their selection / country centre)
  const openMap = async () => {
    setIsOpen(false)
    let startPoint = selectedAddress?.lat != null ? { lat: Number(selectedAddress.lat), lng: Number(selectedAddress.lng ?? selectedAddress.lon) } : null
    if (!startPoint && inputValue.trim().length >= 2) {
      const first = suggestions.find((x) => x.lat != null) || localSuggestions(inputValue)[0]
      if (first) startPoint = { lat: Number(first.lat), lng: Number(first.lng ?? first.lon) }
      else {
        try {
          const r = (await searchAddresses(inputValue, { country: code })).find((x) => x.lat != null)
          if (r) startPoint = { lat: r.lat, lng: r.lng }
        } catch {
          // fall back to the country centre
        }
      }
    }
    setMapStart(startPoint)
    setMapOpen(true)
  }

  const lastMapRequest = useRef(mapRequest)
  useEffect(() => {
    if (mapRequest && mapRequest !== lastMapRequest.current) {
      lastMapRequest.current = mapRequest
      openMap()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRequest])

  const formatted = (s) => {
    if (s.label && !s.isFallback) return s.secondary ? s.label : s.displayName || s.label
    if (s.isFallback) return s.label || s.city || s.displayName
    const parts = [s.houseNumber, s.road, s.suburb, s.city, s.state, s.postcode].filter(Boolean)
    return parts.length ? [...new Set(parts)].join(', ') : s.displayName || 'Address'
  }

  const badge = (s) => {
    if (s.isFallback) return code === 'NG' ? 'Area' : 'City'
    if (s.road) return 'Street'
    if (s.postcode) return 'Postcode'
    if (s.suburb) return 'Area'
    if (s.class === 'amenity' || s.class === 'shop') return 'Landmark'
    if (s.precision === 'area') return 'Area'
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
          onFocus={() => {
            setBlurred(false)
            if (suggestions.length > 0) setIsOpen(true)
          }}
          onBlur={() => setTimeout(() => setBlurred(true), 200)}
          placeholder={placeholder || defaultPlaceholder}
          className="w-full px-4 py-3 pl-10 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white"
          disabled={disabled}
          required={required}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 z-10">
          {(isLoading || loadingPlace) && <FaSpinner className="animate-spin text-text-lighter" />}
          {inputValue && !isLoading && !loadingPlace && (
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

      {!isOpen && !disabled && (
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          {!selectedAddress && (
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className="text-xs text-primary hover:underline flex items-center gap-1 disabled:opacity-60"
            >
              {locating ? <FaSpinner className="animate-spin text-[10px]" /> : <FaLocationArrow className="text-[10px]" />}
              {locating ? 'Finding your location…' : 'Use my current location'}
            </button>
          )}
          <button type="button" onClick={openMap} className="text-xs text-primary hover:underline flex items-center gap-1" data-testid="open-map">
            <FaMapPin className="text-[10px]" /> {selectedAddress ? 'Adjust on map' : 'Set on map'}
          </button>
        </div>
      )}
      {blurred && !selectedAddress && !isOpen && inputValue.trim().length >= minChars && !geoError && (
        <p className="text-xs text-amber-600 mt-1" data-testid="address-unconfirmed">
          Choose an address from the suggestions, or use “Set on map”, so we can price the distance exactly.
        </p>
      )}
      {geoError && (
        <p className="text-xs text-red-500 mt-1" role="alert" data-testid="geo-error">
          {geoError}
        </p>
      )}
      {geoNote && !geoError && <p className="text-xs text-amber-600 mt-1">{geoNote}</p>}

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
                  {s.secondary || [s.state || s.county, c.name].filter(Boolean).join(', ')}
                  {s.isFallback && ' • area centre — add your street for an exact price'}
                </p>
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-t border-gray-100 flex items-center space-x-3"
          >
            {locating ? <FaSpinner className="animate-spin text-blue-500 text-sm" /> : <FaLocationArrow className="text-blue-500 text-sm" />}
            <span className="text-sm text-blue-600 font-medium">{locating ? 'Finding your location…' : 'Use current location'}</span>
          </button>
          <button
            type="button"
            onClick={openMap}
            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-t border-gray-100 flex items-center space-x-3"
          >
            <FaMapPin className="text-blue-500 text-sm" />
            <span className="text-sm text-blue-600 font-medium">Can’t find it? Set it on the map</span>
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

      {mapOpen && (
        <Suspense fallback={null}>
          <MapPinPicker
            open={mapOpen}
            country={code}
            initial={mapStart}
            title={mapTitle || label?.replace(/\*/g, '').trim() || 'Set location on map'}
            onClose={() => setMapOpen(false)}
            onConfirm={(pin) => {
              setMapOpen(false)
              handleSelect(pin)
            }}
          />
        </Suspense>
      )}
    </div>
  )
}

export default AddressAutocomplete
