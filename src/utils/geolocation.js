// ============================================================
// Device location with retries and clear error messages.
//
// Browsers report three failures:
//   1 PERMISSION_DENIED    – the user (or browser) blocked location for this site
//   2 POSITION_UNAVAILABLE – permission is fine, but the DEVICE couldn't get a
//                            fix ("Position update is unavailable"): location
//                            services are off at system level, no Wi-Fi/GPS, etc.
//   3 TIMEOUT              – it took too long
//
// Strategy:
//   1. quick, low-accuracy fix (Wi-Fi / network, cached up to 5 min)
//   2. if that is unavailable or times out, try again with GPS (high accuracy)
// ============================================================

const platform = () => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  if (/Macintosh|Mac OS X/i.test(ua)) return 'mac'
  if (/Windows/i.test(ua)) return 'windows'
  return 'other'
}

const DEVICE_HINT = {
  ios: 'Turn on Settings → Privacy & Security → Location Services, and allow it for your browser (Safari Websites / Chrome).',
  android: 'Turn on Location in your phone’s quick settings, and allow location for your browser.',
  mac: 'Turn on System Settings → Privacy & Security → Location Services and tick your browser. Wi-Fi must be on.',
  windows: 'Turn on Settings → Privacy & security → Location, including “Let desktop apps access your location”. Wi-Fi must be on.',
  other: 'Make sure location services are switched on for your device and browser.',
}

const BLOCKED_HINT = {
  ios: 'Allow location for this site: Settings → Safari (or Chrome) → Location → Ask/Allow, then reload.',
  android: 'Tap the lock icon next to the web address → Permissions → Location → Allow, then try again.',
  mac: 'Click the lock/settings icon next to the web address, allow Location, then try again.',
  windows: 'Click the lock/settings icon next to the web address, allow Location, then try again.',
  other: 'Allow location for this site in your browser settings, then try again.',
}

/** Friendly, actionable text for a geolocation failure. */
export function describeGeoError(error) {
  const p = platform()
  if (!error) return 'Could not get your location. Please type your address instead.'
  if (error.code === 'insecure') return 'Location only works on a secure (https) connection. Please type your address instead.'
  if (error.code === 'unsupported') return 'This browser can’t share your location. Please type your address instead.'
  switch (error.code) {
    case 1:
      return `Location is blocked for this site. ${BLOCKED_HINT[p]}`
    case 2:
      return `Your device couldn’t find your location. ${DEVICE_HINT[p]} Or type your address instead.`
    case 3:
      return 'Finding your location took too long. Move near a window or turn on Wi-Fi and try again, or type your address instead.'
    default:
      return error.message || 'Could not get your location. Please type your address instead.'
  }
}

const once = (options) =>
  new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, options))

/**
 * Get the device position. Resolves { lat, lng, accuracy } or rejects with an
 * Error whose `.code` is 1|2|3|'insecure'|'unsupported' and whose `.message`
 * is already user-friendly.
 */
export async function getDevicePosition() {
  const fail = (code, raw) => {
    const e = new Error(describeGeoError({ code, message: raw?.message }))
    e.code = code
    e.raw = raw
    throw e
  }

  if (typeof window !== 'undefined' && window.isSecureContext === false) fail('insecure')
  if (typeof navigator === 'undefined' || !navigator.geolocation) fail('unsupported')

  const attempts = [
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
  ]

  let lastError
  for (const options of attempts) {
    try {
      const pos = await once(options)
      return { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }
    } catch (err) {
      lastError = err
      if (err?.code === 1) break // blocked: retrying won't help
    }
  }
  return fail(lastError?.code ?? 2, lastError)
}

/** Best effort: position or undefined, never throws (for background updates). */
export async function tryDevicePosition() {
  try {
    return await getDevicePosition()
  } catch {
    return undefined
  }
}
