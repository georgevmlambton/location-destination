import * as config from './config';
import { redis } from './redis';

export async function geocodeAddress(address: string) {
  const cachedLocation = await redis.get(`geocode:${address}`);

  if (cachedLocation) {
    return JSON.parse(cachedLocation) as {
      lat: number;
      lng: number;
    };
  }

  const geocodeUrl = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(address)}&access_token=${config.mapboxToken}`;
  const response = await fetch(geocodeUrl);
  const body = await response.json();

  if (!body?.features?.length) {
    return null;
  }

  const location = {
    lat: body.features[0].geometry.coordinates[1],
    lng: body.features[0].geometry.coordinates[0],
  };

  await redis.set(`geocode:${address}`, JSON.stringify(location), {
    EX: 30 * 24 * 60 * 60,
  });

  return location;
}

export async function getDrivingDurationMinutes(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
) {
  const cachedDuration = await redis.get(
    `drivingDuration:${p1.lat},${p1.lng}-${p2.lat},${p2.lng}`
  );

  if (cachedDuration) {
    return Number(cachedDuration);
  }

  const coordinates = `${p1.lng},${p1.lat};${p2.lng},${p2.lat}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${encodeURIComponent(coordinates)}?alternatives=false&geometries=geojson&language=en&overview=simplified&steps=false&notifications=none&access_token=${config.mapboxToken}`;
  try {
    const response = await fetch(url);
    const body = await response.json();

    if (!body.routes?.length) {
      return null;
    }

    const seconds = body.routes[0].duration;
    const minutes = seconds / 60;

    await redis.set(
      `drivingDuration:${p1.lat},${p1.lng}-${p2.lat},${p2.lng}`,
      minutes.toString(),
      { EX: 2 * 60 * 60 }
    );
  } catch (_) {
    return null;
  }
}
