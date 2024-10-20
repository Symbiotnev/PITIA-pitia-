import L from 'leaflet';

const OSRM_API_URL = 'https://router.project-osrm.org/route/v1/';

export const calculateETA = async (origin, destination, mode = 'foot') => {
  try {
    const response = await fetch(
      `${OSRM_API_URL}${mode}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
    );
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        duration: Math.round(route.duration / 60),
        distance: (route.distance / 1000).toFixed(1),
        coordinates: route.geometry.coordinates.map(coord => [coord[1], coord[0]])
      };
    }
  } catch (error) {
    console.error('Error calculating route:', error);
  }
  return null;
};

export const createBounds = (clientLocation, providerLocation) => {
  return L.latLngBounds(
    [clientLocation.lat, clientLocation.lng],
    [providerLocation.lat, providerLocation.lng]
  );
};