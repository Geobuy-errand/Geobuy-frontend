import axios from 'axios';

const OSRM_BASE_URL = 'https://router.project-osrm.org';

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
  // Regions (approximate)
  england: { lat: 52.3555, lng: -1.1743 },
  scotland: { lat: 56.4907, lng: -4.2026 },
  wales: { lat: 52.1307, lng: -3.7837 },
  northern_ireland: { lat: 54.7877, lng: -6.4923 },
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


const getCoordinatesFromAddress = async (address) => {
  try {
    // Try Nominatim first
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(address)}&` +
      `format=json&` +
      `limit=1&` +
      `countrycodes=gb`
    )
    
    if (response.ok) {
      const data = await response.json()
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          source: 'nominatim'
        }
      }
    }
  } catch (e) {
    console.warn('Nominatim geocoding failed:', e.message)
  }
  
  // Try to extract city name and use fallback
  const cityMatch = address.match(/\b(London|Manchester|Birmingham|Liverpool|Bristol|Sheffield|Leeds|Newcastle|Nottingham|Southampton|Brighton|Oxford|Cambridge|York|Bath|Edinburgh|Glasgow|Aberdeen|Dundee|Cardiff|Swansea|Belfast|Derry)\b/i)
  if (cityMatch) {
    const cityKey = cityMatch[0].toLowerCase()
    if (UK_CITY_COORDINATES[cityKey]) {
      return {
        ...UK_CITY_COORDINATES[cityKey],
        source: 'fallback_city'
      }
    }
  }
  // Try to detect region
  const regionMatch = address.match(/\b(England|Scotland|Wales|Northern Ireland)\b/i)
  if (regionMatch) {
    const regionKey = regionMatch[0].toLowerCase()
    if (UK_CITY_COORDINATES[regionKey]) {
      return {
        ...UK_CITY_COORDINATES[regionKey],
        source: 'fallback_region'
      }
    }
  }
  
  return null
}

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Earth's radius in km
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
    duration: `${Math.round(distanceMiles * 3)} min` // Approximate 3 min per mile
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

/**
 * Get driving distance between two addresses
 */
export const getDistance = async (fromAddress, toAddress, mode = 'DRIVING') => {
  if (!fromAddress || !toAddress) {
    throw new Error('Both addresses are required')
  }

  try {
    // Get coordinates for both addresses
    const fromCoords = await getCoordinatesFromAddress(fromAddress)
    const toCoords = await getCoordinatesFromAddress(toAddress)

    if (!fromCoords || !toCoords) {
      throw new Error('Could not determine coordinates for one or both addresses')
    }

    // Calculate distance
    const distance = calculateDistance(
      fromCoords.lat,
      fromCoords.lng,
      toCoords.lat,
      toCoords.lng
    )

    // Determine accuracy level
    const isFallback = fromCoords.source === 'fallback_city' || 
                       fromCoords.source === 'fallback_region' ||
                       toCoords.source === 'fallback_city' ||
                       toCoords.source === 'fallback_region'

    return {
      distance: {
        value: distance.miles,
        text: distance.text,
        km: distance.km,
        miles: distance.miles,
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
      message: isFallback 
        ? 'Using approximate location based on city/region' 
        : 'Exact distance calculated',
    }

  } catch (error) {
    console.error('Distance calculation error:', error)
    throw new Error(error.message || 'Could not calculate distance')
  }
}

export const getApproximateDistance = (fromAddress, toAddress) => {
  // Return a reasonable default
  return {
    distance: {
      value: 5, // 5 miles default
      text: '5 miles',
      km: 8,
      miles: 5,
    },
    duration: {
      value: 15,
      text: '15 min',
    },
    accuracy: 'estimated',
    isFallback: true,
    message: 'Using estimated distance (default)',
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
  getApproximateDistance
};