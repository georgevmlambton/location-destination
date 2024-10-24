import * as config from './config';

export async function geocodeAddress(address: string) {
  const geocodeUrl = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(address)}&access_token=${config.mapboxToken}`;
  const response = await fetch(geocodeUrl);
  const body = await response.json();

  if (!body?.features?.length) {
    return null;
  }

  return {
    lat: body.features[0].geometry.coordinates[1],
    lng: body.features[0].geometry.coordinates[0],
  };
}
