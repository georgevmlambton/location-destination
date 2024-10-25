import { useEffect, useState } from 'react';

export function usePosition() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    const id = window.navigator.geolocation.watchPosition(setPosition, null, {
      enableHighAccuracy: true,
    });

    return () => {
      window.navigator.geolocation.clearWatch(id);
    };
  }, []);

  return position;
}
