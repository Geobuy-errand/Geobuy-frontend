import axios from 'axios';

const OSRM_BASE_URL = 'https://router.project-osrm.org';

const UK_CITY_COORDINATES = {
  aberdeen: { lat: 57.1497, lng: -2.0943 },
  bath: { lat: 51.3758, lng: -2.3599 },
  belfast: { lat: 54.5973, lng: -5.9301 },
  birmingham: { lat: 52.4862, lng: -1.8904 },
  brighton: { lat: 50.8225, lng: -0.1372 },
  bristol: { lat: 51.4545, lng: -2.5879 },
  cambridge: { lat: 52.2053, lng: 0.1218 },
  cardiff: { lat: 51.4816, lng: -3.1791 },
  derry: { lat: 54.9966, lng: -7.3086 },
  dundee: { lat: 56.4620, lng: -2.9707 },
  edinburgh: { lat: 55.9533, lng: -3.1883 },
  glasgow: { lat: 55.8642, lng: -4.2518 },
  leeds: { lat: 53.8008, lng: -1.5491 },
  leicester: { lat: 52.6369, lng: -1.1398 },
  liverpool: { lat: 53.4084, lng: -2.9916 },
  london: { lat: 51.5074, lng: -0.1278 },
  manchester: { lat: 53.4808, lng: -2.2426 },
  newcastle: { lat: 54.9783, lng: -1.6174 },
  norwich: { lat: 52.6309, lng: 1.2974 },
  nottingham: { lat: 52.9548, lng: -1.1581 },
  oxford: { lat: 51.7520, lng: -1.2577 },
  plymouth: { lat: 50.3755, lng: -4.1427 },
  portsmouth: { lat: 50.8198, lng: -1.0880 },
  sheffield: { lat: 53.3811, lng: -1.4701 },
  southampton: { lat: 50.9097, lng: -1.4044 },
  swansea: { lat: 51.6214, lng: -3.9436 },
  york: { lat: 53.9600, lng: -1.0873 },
  // Regions (approximate)
  england: { lat: 52.3555, lng: -1.1743 },
  scotland: { lat: 56.4907, lng: -4.2026 },
  wales: { lat: 52.1307, lng: -3.7837 },
  northern_ireland: { lat: 54.7877, lng: -6.4923 },
}

const UK_REGIONS = {
  england: { lat: 52.3555, lng: -1.1743 },
  scotland: { lat: 56.4907, lng: -4.2026 },
  wales: { lat: 52.1307, lng: -3.7837 },
  northern_ireland: { lat: 54.7877, lng: -6.4923 },
}


const CITY_ALIASES = {
  aberdeen: ['aberdeen'],
  bath: ['bath'],
  belfast: ['belfast'],
  birmingham: ['birmingham', 'brum'],
  brighton: ['brighton', 'brighton and hove'],
  bristol: ['bristol'],
  cambridge: ['cambridge'],
  cardiff: ['cardiff'],
  derry: ['derry', 'londonderry'],
  dundee: ['dundee'],
  edinburgh: ['edinburgh'],
  glasgow: ['glasgow'],
  leeds: ['leeds'],
  leicester: ['leicester'],
  liverpool: ['liverpool'],
  london: ['london', 'greater london'],
  manchester: ['manchester', 'greater manchester'],
  newcastle: ['newcastle', 'newcastle upon tyne'],
  norwich: ['norwich'],
  nottingham: ['nottingham'],
  oxford: ['oxford'],
  plymouth: ['plymouth'],
  portsmouth: ['portsmouth'],
  sheffield: ['sheffield'],
  southampton: ['southampton'],
  swansea: ['swansea'],
  york: ['york'],
}

const STATE_ALIASES = {
  england: ['england'],
  scotland: ['scotland'],
  wales: ['wales'],
  northern_ireland: ['northern ireland', 'northern_ireland'],
}

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


const extractStateFromAddress = (address) => {
  if (!address) return null
  
  const lowerAddress = address.toLowerCase()
  
  for (const [stateKey, aliases] of Object.entries(STATE_ALIASES)) {
    for (const alias of aliases) {
      if (lowerAddress.includes(alias)) {
        return stateKey
      }
    }
  }
  return null
}

export const getCoordinatesFromAddress = async (address, city = null, state = null) => {
  // Try to build the best possible search query
  let searchQuery = address || ''
  if (city) searchQuery += `, ${city}`
  if (state) searchQuery += `, ${state}`
  
  if (!searchQuery.trim()) {
    // If absolutely nothing, use London
    return { lat: 51.5074, lng: -0.1278, source: 'default' }
  }

  // Try 1: Nominatim API
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `format=json&` +
      `limit=1&` +
      `countrycodes=gb&` +
      `accept-language=en`
    )
    
    if (response.ok) {
      const data = await response.json()
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng, source: 'nominatim' }
        }
      }
    }
  } catch (e) {
    // Silent fail - continue to fallback
  }

  // Try 2: Extract city from address or use provided city
  const cityKey = city || extractCityFromAddress(address)
  if (cityKey && UK_CITY_COORDINATES[cityKey]) {
    return {
      ...UK_CITY_COORDINATES[cityKey],
      source: 'city_fallback'
    }
  }

  // Try 3: Extract state from address or use provided state
  const stateKey = state || extractStateFromAddress(address)
  if (stateKey && UK_REGIONS[stateKey]) {
    return {
      ...UK_REGIONS[stateKey],
      source: 'state_fallback'
    }
  }

  // Try 4: Look for any UK city mention in the address
  const lowerAddress = (address || '').toLowerCase()
  for (const [cityKey, coords] of Object.entries(UK_CITY_COORDINATES)) {
    if (lowerAddress.includes(cityKey)) {
      return { ...coords, source: 'city_mentioned' }
    }
  }

  // Try 5: Look for any UK state mention in the address
  for (const [stateKey, coords] of Object.entries(UK_REGIONS)) {
    if (lowerAddress.includes(stateKey)) {
      return { ...coords, source: 'state_mentioned' }
    }
  }

  // Final fallback: London
  return { lat: 51.5074, lng: -0.1278, source: 'default' }
}
/**
 * Clean and format address for geocoding
 * Removes special characters, extra spaces, and formats for better search results
 */
const formatAddressForGeocoding = (address) => {
  if (!address) return '';
  
  // Remove special characters and extra spaces
  let formatted = address
    .replace(/[^\w\s,.'-]/g, ' ') // Remove special chars except common ones
    .replace(/\s+/g, ' ') // Replace multiple spaces with single
    .trim();
  
  // If address is too long, try to extract key parts
  if (formatted.length > 100) {
    // Try to get street + city + postcode
    const parts = formatted.split(',');
    if (parts.length >= 3) {
      // Take first part (street), last part (postcode/country), and one in between
      const street = parts[0].trim();
      const postcode = parts[parts.length - 2]?.trim() || parts[parts.length - 1].trim();
      const city = parts[1]?.trim() || parts[parts.length - 3]?.trim();
      formatted = `${street}, ${city}, ${postcode}`;
    }
  }
  
  return formatted;
};


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

// Main function to get distance
export const getDistance = async (
  fromAddress, 
  toAddress, 
  fromCity = null, 
  toCity = null,
  fromState = null,
  toState = null,
  mode = 'DRIVING'
) => {
  try {
    // Always get coordinates (will never return null)
    const fromCoords = await getCoordinatesFromAddress(fromAddress, fromCity, fromState)
    const toCoords = await getCoordinatesFromAddress(toAddress, toCity, toState)

    // Calculate distance
    const distance = calculateDistance(
      fromCoords.lat,
      fromCoords.lng,
      toCoords.lat,
      toCoords.lng
    )

    // Determine accuracy level
    const isFallback = fromCoords.source === 'city_fallback' || 
                       fromCoords.source === 'state_fallback' ||
                       fromCoords.source === 'default' ||
                       fromCoords.source === 'city_mentioned' ||
                       fromCoords.source === 'state_mentioned' ||
                       toCoords.source === 'city_fallback' ||
                       toCoords.source === 'state_fallback' ||
                       toCoords.source === 'default' ||
                       toCoords.source === 'city_mentioned' ||
                       toCoords.source === 'state_mentioned'

    // Build accuracy message (only used internally)
    let accuracyMessage = 'Exact distance'
    if (fromCoords.source === 'nominatim' && toCoords.source === 'nominatim') {
      accuracyMessage = 'Exact'
    } else if (fromCoords.source === 'city_fallback' || toCoords.source === 'city_fallback') {
      accuracyMessage = 'City centre'
    } else if (fromCoords.source === 'state_fallback' || toCoords.source === 'state_fallback') {
      accuracyMessage = 'Region'
    } else if (fromCoords.source === 'default' || toCoords.source === 'default') {
      accuracyMessage = 'Estimated'
    } else {
      accuracyMessage = 'Approximate'
    }

    const result = {
      distance: {
        value: Math.round(distance.miles * 10) / 10,
        text: distance.text,
        km: Math.round(distance.km * 10) / 10,
        miles: Math.round(distance.miles * 10) / 10,
      },
      duration: {
        value: parseInt(distance.duration),
        text: distance.duration,
      },
      accuracy: isFallback ? 'approximate' : 'exact',
      source: {
        from: fromCoords.source || 'unknown',
        to: toCoords.source || 'unknown',
      },
      isFallback: isFallback,
      message: accuracyMessage,
      details: {
        from: {
          address: fromAddress,
          city: fromCity,
          state: fromState,
          source: fromCoords.source,
        },
        to: {
          address: toAddress,
          city: toCity,
          state: toState,
          source: toCoords.source,
        },
      },
    }

    return result

  } catch (error) {
    console.warn('Distance calculation error:', error)
    // ALWAYS return a fallback distance
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
      message: 'Estimated',
      details: {
        from: { address: fromAddress, city: fromCity, state: fromState },
        to: { address: toAddress, city: toCity, state: toState },
      },
    }
  }
}

/**
 * Extract postcode from address
 */
const extractPostcode = (address) => {
  if (!address) return null;
  
  // UK postcode regex
  const postcodeRegex = /([A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2})/i;
  const match = address.match(postcodeRegex);
  return match ? match[1].toUpperCase() : null;
};

/**
 * Geocode address with multiple fallback strategies
 */
const geocodeAddress = async (address, retryCount = 0) => {
  try {
    // Strategy 1: Try with full address (cleaned)
    let formattedAddress = formatAddressForGeocoding(address);
    console.log('🔍 Attempt 1 - Full address:', formattedAddress);
    
    let response = await makeGeocodeRequest(formattedAddress);
    
    // Strategy 2: If no results, try with just postcode
    if (response.data.length === 0) {
      const postcode = extractPostcode(address);
      if (postcode) {
        console.log('🔍 Attempt 2 - Postcode only:', postcode);
        response = await makeGeocodeRequest(postcode);
      }
    }
    
    // Strategy 3: Try with city and postcode
    if (response.data.length === 0) {
      const parts = address.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        // Take last 2-3 parts (city, postcode, country)
        const cityParts = parts.slice(-3).join(', ');
        console.log('🔍 Attempt 3 - City/Postcode:', cityParts);
        response = await makeGeocodeRequest(cityParts);
      }
    }
    
    // Strategy 4: Try with just street and city
    if (response.data.length === 0) {
      const parts = address.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        const streetCity = `${parts[0]}, ${parts[1]}`;
        console.log('🔍 Attempt 4 - Street + City:', streetCity);
        response = await makeGeocodeRequest(streetCity);
      }
    }
    
    // Strategy 5: Try with just the first part (street name)
    if (response.data.length === 0) {
      const firstPart = address.split(',')[0]?.trim();
      if (firstPart && firstPart.length > 5) {
        console.log('🔍 Attempt 5 - Street only:', firstPart);
        response = await makeGeocodeRequest(firstPart);
      }
    }
    
    // If still no results, try with a more generic search
    if (response.data.length === 0) {
      const postcode = extractPostcode(address);
      if (postcode) {
        // Try with postcode and country
        console.log('🔍 Attempt 6 - Postcode + UK:', `${postcode}, UK`);
        response = await makeGeocodeRequest(`${postcode}, UK`);
      }
    }
    
    // If still no results after all attempts
    if (response.data.length === 0) {
      throw new Error(`Address not found: ${address}`);
    }
    
    const result = response.data[0];
    
    // Check if it's a UK address
    const isUK = result.display_name?.includes('United Kingdom') ||
                 result.display_name?.includes('UK') ||
                 result.address?.country_code === 'gb';
    
    if (!isUK) {
      throw new Error('Address must be in the United Kingdom');
    }
    
    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
      importance: result.importance || 0,
    };
    
  } catch (error) {
    console.error('Geocoding error:', error.message);
    
    // If we haven't tried too many times and have a postcode, try with just postcode
    if (retryCount < 2) {
      const postcode = extractPostcode(address);
      if (postcode) {
        console.log(`🔄 Retry ${retryCount + 1} - Postcode only:`, postcode);
        return geocodeAddress(postcode, retryCount + 1);
      }
    }
    
    throw error;
  }
};

/**
 * Make geocoding request to Nominatim
 */
const makeGeocodeRequest = async (query) => {
  return await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q: query,
      format: 'json',
      limit: 5,
      countrycodes: 'gb',
      addressdetails: 1,
      dedupe: 1,
    },
    headers: {
      'User-Agent': 'GEOBUY-Errands/1.0',
    },
    timeout: 10000,
  });
};


export const getApproximateDistance = (
  fromAddress, 
  toAddress, 
  fromCity = null, 
  toCity = null,
  fromState = null,
  toState = null
) => {
  // Use the same logic as getDistance but synchronous
  const fromCityKey = fromCity || extractCityFromAddress(fromAddress)
  const toCityKey = toCity || extractCityFromAddress(toAddress)
  const fromStateKey = fromState || extractStateFromAddress(fromAddress)
  const toStateKey = toState || extractStateFromAddress(toAddress)
  
  let miles = 5
  
  // Try cities
  if (fromCityKey && toCityKey && fromCityKey !== toCityKey) {
    const fromCoords = UK_CITY_COORDINATES[fromCityKey]
    const toCoords = UK_CITY_COORDINATES[toCityKey]
    if (fromCoords && toCoords) {
      const dist = calculateDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng)
      miles = Math.min(dist.miles, 50)
    }
  } else if (fromCityKey && toCityKey && fromCityKey === toCityKey) {
    miles = 3
  }
  
  // Try states
  if (miles === 5 && fromStateKey && toStateKey && fromStateKey !== toStateKey) {
    const fromCoords = UK_REGIONS[fromStateKey]
    const toCoords = UK_REGIONS[toStateKey]
    if (fromCoords && toCoords) {
      const dist = calculateDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng)
      miles = Math.min(dist.miles, 50)
    }
  }
  
  // If we have one city and one state
  if (miles === 5 && fromCityKey && !toCityKey && toStateKey) {
    const fromCoords = UK_CITY_COORDINATES[fromCityKey]
    const toCoords = UK_REGIONS[toStateKey]
    if (fromCoords && toCoords) {
      const dist = calculateDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng)
      miles = Math.min(dist.miles, 50)
    }
  }
  
  if (miles === 5 && !fromCityKey && fromStateKey && toCityKey) {
    const fromCoords = UK_REGIONS[fromStateKey]
    const toCoords = UK_CITY_COORDINATES[toCityKey]
    if (fromCoords && toCoords) {
      const dist = calculateDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng)
      miles = Math.min(dist.miles, 50)
    }
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
    message: 'Estimated',
  }
}

/**
 * Validate a UK address
 */
export const validateUKAddress = async (address) => {
  try {
    const result = await geocodeAddress(address);
    return {
      isValid: true,
      coordinates: {
        lat: result.lat,
        lon: result.lon,
      },
      formattedAddress: result.displayName,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message,
    };
  }
};

/**
 * Get batch distances for multiple destinations
 */
export const getBatchDistances = async (originAddress, destinationAddresses, mode = 'DRIVING') => {
  try {
    // Geocode origin
    const origin = await geocodeAddress(originAddress);
    
    // Geocode all destinations
    const destinations = await Promise.all(
      destinationAddresses.map(addr => geocodeAddress(addr))
    );

    // Build coordinates string
    const destCoords = destinations.map(d => `${d.lon},${d.lat}`).join(';');
    const originCoord = `${origin.lon},${origin.lat}`;
    const allCoords = `${originCoord};${destCoords}`;

    const travelMode = mode.toLowerCase();
    const response = await axios.get(
      `${OSRM_BASE_URL}/table/v1/${travelMode}/${allCoords}`,
      {
        params: {
          annotations: 'distance,duration',
        },
        timeout: 15000,
      }
    );

    if (!response.data.distances || response.data.distances.length === 0) {
      throw new Error('No routes found');
    }

    const distances = response.data.distances[0] || [];
    const durations = response.data.durations[0] || [];

    return destinations.map((dest, index) => ({
      destination: dest.displayName,
      distance: {
        value: distances[index] ? distances[index] / 1609.34 : null,
        text: distances[index] ? `${(distances[index] / 1609.34).toFixed(1)} miles` : 'Unknown',
      },
      duration: {
        value: durations[index] ? durations[index] / 60 : null,
        text: durations[index] ? `${Math.round(durations[index] / 60)} minutes` : 'Unknown',
      },
    }));
    
  } catch (error) {
    console.error('Batch distance calculation error:', error.message);
    return destinationAddresses.map(() => ({
      distance: { value: null, text: 'Unknown' },
      duration: { value: null, text: 'Unknown' },
    }));
  }
};

export default {
  getDistance,
  getBatchDistances,
  validateUKAddress,
  getCoordinatesFromAddress,
  getApproximateDistance,
  calculateDistance,
  extractCityFromAddress,
  extractStateFromAddress,
  UK_CITY_COORDINATES,
  UK_REGIONS,
};