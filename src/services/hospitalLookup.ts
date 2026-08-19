import { HospitalResult } from '../types';

// Multiple public Overpass endpoints as fallbacks with full routing paths
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://kumi.systems',
  'https://openstreetmap.ru'
];

function haversineKM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function findNearbyHospitals(lat: number, lon: number, radiusMeters = 8000): Promise<HospitalResult[]> {
  const query = `[out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lon});
    );
    out center 20;`;

  // Loop through available servers if one fails or times out
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      // Create a strict 5-second timeout mechanism
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(endpoint, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Server returned status ${res.status}`);

      const data = await res.json();
      
      if (!data || !data.elements) continue;

      // Explicitly return as HospitalResult object mapping array items
      return data.elements.map((el: any): HospitalResult => {
        const hLat = el.lat ?? el.center?.lat ?? lat;
        const hLon = el.lon ?? el.center?.lon ?? lon;
        return {
          id: el.id,
          name: el.tags?.name || el.tags?.['name:en'] || 'Unknown Medical Center',
          lat: hLat,
          lon: hLon,
          distance: haversineKM(lat, lon, hLat, hLon),
          type: el.tags?.amenity === 'clinic' ? 'clinic' : 'hospital',
          address: el.tags?.['addr:street'] 
            ? `${el.tags?.['addr:street']} ${el.tags?.['addr:housenumber'] || ''}`.trim()
            : undefined
        };
      }).sort((a: HospitalResult, b: HospitalResult) => a.distance - b.distance);

    } catch (error) {
      console.warn(`Endpoint ${endpoint} failed or timed out. Trying next fallback...`);
      // Continues automatically to the next server url in the array
    }
  }

  // If the loop finishes and all servers fail
  throw new Error("All public medical map registries are currently overloaded or timed out. Please try again shortly.");
}
