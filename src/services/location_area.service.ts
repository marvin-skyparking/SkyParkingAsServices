import { LocationArea } from '../models/location_area.model';
import LocationLot from '../models/location_lot.model';

/**
 * Get all location areas with selected fields
 */
export async function getAllLocations() {
  const locations = await LocationArea.findAll({
    attributes: ['location_code', 'location_name', 'coordinate', 'address']
  });

  return locations;
}

/**
 * Haversine formula to calculate distance between two coordinates (in km)
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Get nearby locations based on latitude and longitude
 */
export async function getNearbyLocations(
  latitude: number,
  longitude: number,
  radius: number
): Promise<any[]> {
  // No need to return `LocationAreaWithLots`
  try {
    const locations = await LocationArea.findAll({
      include: [
        {
          model: LocationLot,
          as: 'lots', // Must match `hasMany` alias in LocationArea
          required: false // Allows locations without lots
        }
      ]
    });

    const nearbyLocations = locations.filter((location) => {
      let coordinate;
      try {
        coordinate =
          typeof location.coordinate === 'string'
            ? JSON.parse(location.coordinate)
            : location.coordinate;
      } catch (error) {
        console.error(
          `Error parsing coordinate for ${location.location_code}:`,
          error
        );
        return false;
      }

      if (
        !coordinate ||
        typeof coordinate.latitude !== 'number' ||
        typeof coordinate.longitude !== 'number'
      ) {
        console.warn(
          `Invalid coordinate format for location ${location.location_code}`
        );
        return false;
      }

      const distance = haversineDistance(
        latitude,
        longitude,
        coordinate.latitude,
        coordinate.longitude
      );
      return distance <= radius;
    });

    return nearbyLocations;
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    throw new Error('Failed to fetch nearby locations');
  }
}
