import type { HospitalResult } from '../types';

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function findNearbyHospitals(lat: number, lon: number, radiusMeters = 8000): Promise<HospitalResult[]> {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lon});
    );
    out center 20;
  `;

  try {
    const res = await fetch(OVERPASS_ENDPOINT, {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' },
    });
    if (!res.ok) throw new Error(`Overpass error ${res.status}`);
    const data = await res.json();

    const results: HospitalResult[] = (data.elements ?? [])
      .map((el: any) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        if (elLat == null || elLon == null) return null;
        return {
          id: String(el.id),
          name: el.tags?.name ?? 'Unnamed facility',
          lat: elLat,
          lon: elLon,
          distanceKm: Math.round(haversineKm(lat, lon, elLat, elLon) * 10) / 10,
          phone: el.tags?.phone ?? el.tags?.['contact:phone'],
          type: el.tags?.amenity === 'hospital' ? 'hospital' : 'clinic',
        } as HospitalResult;
      })
      .filter(Boolean)
      .sort((a: HospitalResult, b: HospitalResult) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

    return results;
  } catch (err) {
    // Network unavailable / Overpass rate-limited — return empty and let the
    // UI fall back to the static district emergency-contacts list.
    return [];
  }
}
