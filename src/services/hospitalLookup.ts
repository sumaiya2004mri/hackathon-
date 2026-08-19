import { HospitalResult } from '../types';

// Multiple public Overpass endpoints as fallbacks.
// NOTE: each must point at the actual interpreter route, not the bare domain.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

const QUERY_TIMEOUT_SECONDS = 15;
const FETCH_TIMEOUT_MS = (QUERY_TIMEOUT_SECONDS + 5) * 1000; // give the server's own timeout room to fire first

function haversineKM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function findNearbyHospitals(
  lat: number,
  lon: number,
  radiusMeters = 8000
): Promise<HospitalResult[]> {
  const query = `[out:json][timeout:${QUERY_TIMEOUT_SECONDS}];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lon});
    );
    out center 20;`;

  const radiusKM = radiusMeters / 1000;
  let lastError: unknown = null;

  // Loop through available servers if one fails or times out
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'text/plain' },
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Server returned status ${res.status}`);

      const data = await res.json();
      if (!data || !Array.isArray(data.elements)) {
        throw new Error('Malformed response: missing elements array');
      }

      const results: HospitalResult[] = data.elements
        .map((el: any) => {
          const hLat = el.lat ?? el.center?.lat ?? null;
          const hLon = el.lon ?? el.center?.lon ?? null;

          // Skip anything without usable coordinates rather than
          // silently falling back to the search origin.
          if (hLat == null || hLon == null) return null;

          const housenumber = el.tags?.['addr:housenumber'];
          const street = el.tags?.['addr:street'];
          const address = street ? `${housenumber ? housenumber + ' ' : ''}${street}` : undefined;

          return {
            id: el.id,
            name: el.tags?.name || el.tags?.['name:en'] || 'Unknown Medical Center',
            lat: hLat,
            lon: hLon,
            distance: haversineKM(lat, lon, hLat, hLon),
            type: el.tags?.amenity === 'clinic' ? 'clinic' : 'hospital',
            address,
          } as HospitalResult;
        })
        .filter((r: HospitalResult | null): r is HospitalResult => r !== null)
        // Overpass' `around` filter is exact for nodes, but a way/relation's
        // computed center can fall slightly outside the requested radius.
        .filter((r: HospitalResult) => r.distance <= radiusKM * 1.05)
        .sort((a: HospitalResult, b: HospitalResult) => a.distance - b.distance);

      return results;
    } catch (error) {
      lastError = error;
      console.warn(`Endpoint ${endpoint} failed or timed out. Trying next fallback...`, error);
      // Continue automatically to the next server url in the array
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // If the loop finishes and all servers fail
  throw new Error(
    `All public medical map registries are currently overloaded or timed out. Please try again shortly.${
      lastError instanceof Error ? ` (last error: ${lastError.message})` : ''
    }`
  );
}