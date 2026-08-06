import axios from 'axios';

const OSRM_BASE_URL = 'https://router.project-osrm.org';

export const getDistance = async (originAddress, destinationAddress, mode = 'DRIVING') => {
  console.log('📍 getDistance called with:', { originAddress, destinationAddress, mode })
  
  try {
    // Validate inputs
    if (!originAddress || !destinationAddress) {
      throw new Error('Please provide both origin and destination addresses');
    }

    // Geocode both addresses using Nominatim
    const geocode = async (address) => {
      console.log('🔍 Geocoding:', address)
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          countrycodes: 'gb',
        },
        headers: {
          'User-Agent': 'GEOBUY-Errands/1.0',
        },
        timeout: 10000,
      });

      console.log('📡 Geocode response:', response.data)

      if (response.data.length === 0) {
        throw new Error(`Address not found: ${address}`);
      }

      const result = response.data[0];
      
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
      };
    };

    const [origin, destination] = await Promise.all([
      geocode(originAddress),
      geocode(destinationAddress),
    ]);

    console.log('📍 Geocoded:', { origin, destination })

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

    console.log('📡 OSRM response:', response.data)

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
    console.error('❌ Distance calculation error:', error.message)
    throw error;
  }
};

export default { getDistance };