import { useEffect, useState } from 'react';

export interface Coords {
  lat: number;
  lon: number;
  isMock: boolean;
}

// Fallback: central Dhaka. Swap per-deployment if targeting a different city.
const MOCK_FALLBACK: Coords = { lat: 23.8103, lon: 90.4125, isMock: true };

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<'idle' | 'locating' | 'granted' | 'denied' | 'unsupported'>('idle');

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      setCoords(MOCK_FALLBACK);
      return;
    }

    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, isMock: false });
        setStatus('granted');
      },
      () => {
        setStatus('denied');
        setCoords(MOCK_FALLBACK);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  return { coords, status };
}
