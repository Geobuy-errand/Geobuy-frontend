import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { FaTimes, FaLocationArrow, FaSpinner, FaMapMarkerAlt, FaCheck } from 'react-icons/fa'
import { getCountry, normalizeCountry, isWithinCountry } from '../config/countries'
import { reverseGeocode } from '../services/geoApi'
import { getDevicePosition } from '../utils/geolocation'

// Free OpenStreetMap tiles by default. For heavy production traffic set
// VITE_MAP_TILE_URL to a tile provider you have an account with
// (e.g. MapTiler, Stadia, Carto) and VITE_MAP_TILE_ATTRIBUTION to match.
const TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTRIBUTION = import.meta.env.VITE_MAP_TILE_ATTRIBUTION || '&copy; OpenStreetMap contributors'

/** Reports the map centre whenever the user stops panning/zooming. */
function CentreWatcher({ onMove, onMoveStart }) {
  useMapEvents({
    movestart: () => onMoveStart(),
    moveend: (e) => {
      const c = e.target.getCenter()
      onMove({ lat: c.lat, lng: c.lng })
    },
  })
  return null
}

function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.setView([target.lat, target.lng], Math.max(map.getZoom(), 17))
  }, [target, map])
  return null
}

/**
 * Full-screen "set location on map" picker (Bolt/Uber style).
 * The pin stays in the middle; the user moves the map under it.
 *
 * onConfirm(suggestion) gets the same shape AddressAutocomplete's onSelect does.
 */
const MapPinPicker = ({ open, onClose, onConfirm, country: countryProp, initial, title = 'Set location on map' }) => {
  const code = normalizeCountry(countryProp)
  const c = getCountry(code)
  const start = initial?.lat != null ? initial : c.defaultCenter
  const [centre, setCentre] = useState(start)
  const [moving, setMoving] = useState(false)
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [flyTarget, setFlyTarget] = useState(null)
  const [locating, setLocating] = useState(false)
  const lookupSeq = useRef(0)

  useEffect(() => {
    if (!open) return
    setCentre(start)
    setPlace(null)
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Name the spot under the pin
  useEffect(() => {
    if (!open || moving) return undefined
    if (!isWithinCountry(centre.lat, centre.lng, code)) {
      setPlace(null)
      setError(`Move the pin to a place in ${c.name}.`)
      return undefined
    }
    setError('')
    const seq = ++lookupSeq.current
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const r = await reverseGeocode(centre.lat, centre.lng, code)
        if (seq === lookupSeq.current) setPlace(r)
      } catch {
        if (seq === lookupSeq.current) setPlace({ displayName: `Pinned location (${centre.lat.toFixed(5)}, ${centre.lng.toFixed(5)})` })
      } finally {
        if (seq === lookupSeq.current) setLoading(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [centre, moving, open, code, c.name])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const useMyLocation = async () => {
    setLocating(true)
    setError('')
    try {
      const p = await getDevicePosition()
      if (!isWithinCountry(p.lat, p.lng, code)) setError(`Your current location is outside ${c.name}.`)
      else setFlyTarget({ lat: p.lat, lng: p.lng })
    } catch (e) {
      setError(e.message)
    } finally {
      setLocating(false)
    }
  }

  const confirm = () => {
    if (!isWithinCountry(centre.lat, centre.lng, code)) return
    const label = place?.displayName || `Pinned location (${centre.lat.toFixed(5)}, ${centre.lng.toFixed(5)})`
    onConfirm?.({
      displayName: label,
      lat: centre.lat,
      lon: centre.lng,
      lng: centre.lng,
      houseNumber: place?.houseNumber || '',
      road: place?.road || '',
      suburb: place?.suburb || '',
      city: place?.city || '',
      state: place?.state || '',
      postcode: place?.postcode || '',
      country: c.name,
      countryCode: code,
      type: 'pin',
      precision: 'exact',
      isFallback: false,
    })
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl overflow-hidden flex flex-col h-[92vh] sm:h-[80vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-text">{title}</h3>
          <button type="button" onClick={onClose} className="p-2 text-text-light hover:text-text" aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <div className="relative flex-1" data-testid="map-pin-picker">
          <MapContainer center={[start.lat, start.lng]} zoom={initial?.lat != null ? 16 : 12} className="h-full w-full" zoomControl>
            <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} />
            <CentreWatcher
              onMoveStart={() => setMoving(true)}
              onMove={(p) => {
                setMoving(false)
                setCentre(p)
              }}
            />
            <FlyTo target={flyTarget} />
          </MapContainer>

          {/* Fixed pin in the centre of the map */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-full">
            <FaMapMarkerAlt className={`text-4xl drop-shadow ${moving ? 'text-primary/70 -translate-y-2' : 'text-primary'} transition-transform`} />
          </div>

          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="absolute right-3 bottom-3 z-[500] bg-white shadow-md rounded-full px-3 py-2 text-sm text-primary flex items-center gap-2"
          >
            {locating ? <FaSpinner className="animate-spin" /> : <FaLocationArrow />} My location
          </button>
        </div>

        <div className="p-4 border-t space-y-3">
          <p className="text-xs text-text-lighter">Move the map so the pin sits exactly on the place.</p>
          <div className="min-h-[2.5rem] text-sm text-text" data-testid="map-pin-label">
            {error ? (
              <span className="text-red-600">{error}</span>
            ) : loading || moving ? (
              <span className="text-text-light flex items-center gap-2">
                <FaSpinner className="animate-spin" /> Finding address…
              </span>
            ) : (
              place?.displayName
            )}
          </div>
          <button
            type="button"
            onClick={confirm}
            disabled={moving || !isWithinCountry(centre.lat, centre.lng, code)}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaCheck /> Use this location
          </button>
        </div>
      </div>
    </div>
  )
}

export default MapPinPicker
