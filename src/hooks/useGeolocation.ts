import { useEffect, useState } from 'react';

export interface Coords {
  lat: number;
  lon: number;
  isMock: boolean;
}

export const DISTRICT_COORDS: Record<string, { lat: number; lon: number }> = {
  Rajshahi: { lat: 24.3745, lon: 88.6042 },
  Dhaka: { lat: 23.8103, lon: 90.4125 },
  Chattogram: { lat: 22.3569, lon: 91.7832 },
  Khulna: { lat: 22.8456, lon: 89.5403 },
  Sylhet: { lat: 24.8949, lon: 91.8687 },
  Barishal: { lat: 22.7010, lon: 90.3535 },
  Rangpur: { lat: 25.7439, lon: 89.2752 },
  Mymensingh: { lat: 24.7471, lon: 90.4203 },
};

const DEFAULT_FALLBACK: Coords = { lat: 23.8103, lon: 90.4125, isMock: true };

export function useGeolocation(preferredDistrict?: string) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<'idle' | 'locating' | 'granted' | 'denied' | 'unsupported'>('idle');

  useEffect(() => {
    const fallback: Coords =
      preferredDistrict && DISTRICT_COORDS[preferredDistrict]
        ? { ...DISTRICT_COORDS[preferredDistrict], isMock: true }
        : DEFAULT_FALLBACK;

    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      setCoords(fallback);
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
        setCoords(fallback);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, [preferredDistrict]);

  return { coords, status };
}
