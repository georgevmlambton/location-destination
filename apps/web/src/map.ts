export const geocode = async (address: string) => {
  const geocodeUrl = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(address)}&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`;
  const response = await fetch(geocodeUrl);
  const body = await response.json();
  return {
    lat: body.features[0].geometry.coordinates[1],
    lng: body.features[0].geometry.coordinates[0],
  };
};
