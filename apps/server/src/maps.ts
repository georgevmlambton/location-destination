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

export async function getDrivingDurationMinutes(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
) {
  const coordinates = `${p1.lng},${p1.lat};${p2.lng},${p2.lat}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${encodeURIComponent(coordinates)}?alternatives=false&geometries=geojson&language=en&overview=simplified&steps=false&notifications=none&access_token=${config.mapboxToken}`;
  try {
    const response = await fetch(url);
    const body = await response.json();

    if (!body.routes?.length) {
      return null;
    }

    const seconds = body.routes[0].duration;
    return seconds / 60;
  } catch (_) {
    return null;
  }
}
