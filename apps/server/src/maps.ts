import * as config from './config';
import { redis } from './redis';

export async function geocodeAddress(address: string) {
  try {
    const cachedLocation = await redis.get(`geocode:${address}`);

    if (cachedLocation) {
      return JSON.parse(cachedLocation) as {
        lat: number;
        lng: number;
      };
    }
  } catch (e) {
    console.error(e);
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

  try {
    await redis.set(`geocode:${address}`, JSON.stringify(location), {
      EX: 30 * 24 * 60 * 60,
    });
  } catch (e) {
    console.error(e);
  }

  return location;
}

export async function getDrivingDurationMinutes(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
) {
  try {
    const cachedDuration = await redis.get(getRedisDurationKey(p1, p2));

    if (cachedDuration) {
      return Number(cachedDuration);
    }
  } catch (e) {
    console.error(e);
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

    try {
      await redis.set(getRedisDurationKey(p1, p2), minutes.toString(), {
        EX: 2 * 60 * 60,
      });
    } catch (e) {
      console.error(e);
    }

    return minutes;
  } catch (_) {
    return null;
  }
}

function getRedisDurationKey(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
) {
  return `drivingDuration:${p1.lat.toFixed(3)},${p1.lng.toFixed(3)} ${p2.lat.toFixed(3)},${p2.lng.toFixed(3)}`;
}
