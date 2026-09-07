// UK City Centre Coordinates (for fallback)
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

// City name variations for matching
const CITY_ALIASES = {
  london: ['london', 'greater london', 'city of london'],
  manchester: ['manchester', 'greater manchester'],
  birmingham: ['birmingham', 'brum'],
  liverpool: ['liverpool', 'merseyside'],
  leeds: ['leeds', 'west yorkshire'],
  sheffield: ['sheffield', 'south yorkshire'],
  bristol: ['bristol', 'avon'],
  newcastle: ['newcastle', 'newcastle upon tyne'],
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

// Extract city from address
const extractCityFromAddress = (address) => {
  if (!address) return null
  
  const lowerAddress = address.toLowerCase()
  
  for (const [cityKey, aliases] of Object.entries(CITY_ALIASES)) {
    for (const alias of aliases) {
      if (lowerAddress.includes(alias)) {
        return cityKey
      }
    }
  }
  return null
}

// Get coordinates from address with fallback
export const getCoordinatesFromAddress = async (address) => {
  if (!address || address.trim() === '') {
    return null
  }

  // Try 1: Nominatim API with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(address)}&` +
      `format=json&` +
      `limit=1&` +
      `countrycodes=gb&` +
      `accept-language=en`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng, source: 'nominatim' };
        }
      }
    }
  } catch (e) {
    console.warn('Nominatim geocoding failed:', e.message);
  }

  // Try 2: Extract city from address
  const cityKey = extractCityFromAddress(address);
  if (cityKey && UK_CITY_COORDINATES[cityKey]) {
    return {
      ...UK_CITY_COORDINATES[cityKey],
      source: 'city_fallback'
    };
  }

  // Try 3: Default to London
  return { lat: 51.5074, lng: -0.1278, source: 'default' };
}

// Calculate distance using Haversine formula
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distanceKm = R * c
  const distanceMiles = distanceKm * 0.621371
  return {
    km: distanceKm,
    miles: distanceMiles,
    text: `${distanceMiles.toFixed(1)} miles`,
    duration: `${Math.round(Math.max(distanceMiles * 3, 5))} min`
  }
}

// Main function - address only
export const getDistance = async (fromAddress, toAddress, mode = 'DRIVING') => {
  if (!fromAddress || !toAddress) {
    throw new Error('Both addresses are required')
  }

  try {
    let fromCoords = await getCoordinatesFromAddress(fromAddress)
    let toCoords = await getCoordinatesFromAddress(toAddress)

    if (!fromCoords || !toCoords) {
      // Use London as fallback for both
      fromCoords = fromCoords || { lat: 51.5074, lng: -0.1278, source: 'default' }
      toCoords = toCoords || { lat: 51.5074, lng: -0.1278, source: 'default' }
    }

    const distance = calculateDistance(
      fromCoords.lat,
      fromCoords.lng,
      toCoords.lat,
      toCoords.lng
    )

    const isFallback = fromCoords.source === 'city_fallback' || 
                       fromCoords.source === 'default' ||
                       toCoords.source === 'city_fallback' ||
                       toCoords.source === 'default'

    // If both are default and distance is huge, cap it
    let finalDistance = distance
    if (fromCoords.source === 'default' && toCoords.source === 'default') {
      finalDistance = {
        miles: 5,
        km: 8,
        text: '5.0 miles',
        duration: '15 min'
      }
    }

    const result = {
      distance: {
        value: Math.round(finalDistance.miles * 10) / 10,
        text: finalDistance.text,
        km: Math.round(finalDistance.km * 10) / 10,
        miles: Math.round(finalDistance.miles * 10) / 10,
      },
      duration: {
        value: parseInt(finalDistance.duration),
        text: finalDistance.duration,
      },
      accuracy: isFallback ? 'approximate' : 'exact',
      isFallback: isFallback,
      message: isFallback 
        ? 'Using approximate location. Please verify the address.' 
        : 'Exact distance calculated',
    }

    return result

  } catch (error) {
    console.error('Distance calculation error:', error)
    return {
      distance: {
        value: 5,
        text: '5.0 miles',
        km: 8,
        miles: 5,
      },
      duration: {
        value: 15,
        text: '15 min',
      },
      accuracy: 'estimated',
      isFallback: true,
      message: 'Using estimated distance (5 miles)',
    }
  }
}

// Fallback function
export const getApproximateDistance = (fromAddress, toAddress) => {
  const fromCity = extractCityFromAddress(fromAddress)
  const toCity = extractCityFromAddress(toAddress)
  
  let miles = 5 // default
  
  if (fromCity && toCity && fromCity !== toCity) {
    const fromCoords = UK_CITY_COORDINATES[fromCity]
    const toCoords = UK_CITY_COORDINATES[toCity]
    if (fromCoords && toCoords) {
      const dist = calculateDistance(
        fromCoords.lat,
        fromCoords.lng,
        toCoords.lat,
        toCoords.lng
      )
      miles = Math.min(dist.miles, 50) // Cap at 50 miles
    }
  }
  
  if (fromCity && toCity && fromCity === toCity) {
    miles = 3
  }
  
  return {
    distance: {
      value: Math.round(miles * 10) / 10,
      text: `${Math.round(miles * 10) / 10} miles`,
      km: Math.round(miles * 1.609 * 10) / 10,
      miles: Math.round(miles * 10) / 10,
    },
    duration: {
      value: Math.round(Math.max(miles * 3, 5)),
      text: `${Math.round(Math.max(miles * 3, 5))} min`,
    },
    accuracy: 'estimated',
    isFallback: true,
    message: 'Using estimated distance based on location',
  }
}

export default {
  getDistance,
  getApproximateDistance,
  getCoordinatesFromAddress,
  calculateDistance,
  extractCityFromAddress,
  UK_CITY_COORDINATES,
}