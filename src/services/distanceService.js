import axios from 'axios';

const OSRM_BASE_URL = 'https://router.project-osrm.org';

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
export const getDistance = async (originAddress, destinationAddress, mode = 'DRIVING') => {
  console.log('📍 getDistance called with:', { originAddress, destinationAddress, mode });
  
  try {
    // Validate inputs
    if (!originAddress || !destinationAddress) {
      throw new Error('Please provide both origin and destination addresses');
    }

    // Geocode both addresses with fallback strategies
    console.log('🔍 Geocoding origin...');
    const [origin, destination] = await Promise.all([
      geocodeAddress(originAddress),
      geocodeAddress(destinationAddress),
    ]);

    console.log('📍 Geocoded:', { 
      origin: origin.displayName, 
      destination: destination.displayName 
    });

    // Call OSRM API
    const travelMode = mode.toLowerCase();
    const response = await axios.get(
      `${OSRM_BASE_URL}/route/v1/${travelMode}/${origin.lon},${origin.lat};${destination.lon},${destination.lat}`,
      {
        params: {
          overview: 'false',
          steps: 'false',
          alternatives: 'false',
        },
        timeout: 15000,
      }
    );

    console.log('📡 OSRM response:', response.data);

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error('No route found between these locations');
    }

    const route = response.data.routes[0];
    
    const distanceMiles = route.distance / 1609.34;
    const durationMinutes = route.duration / 60;

    return {
      distance: {
        value: distanceMiles,
        text: `${distanceMiles.toFixed(1)} miles`,
      },
      duration: {
        value: durationMinutes,
        text: `${Math.round(durationMinutes)} minutes`,
      },
      origin: origin.displayName,
      destination: destination.displayName,
    };
    
  } catch (error) {
    console.error('❌ Distance calculation error:', error.message);
    throw new Error(`Distance calculation failed: ${error.message}`);
  }
};

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
};