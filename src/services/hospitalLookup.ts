import type { HospitalResult } from '../types';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export const STATIC_EMERGENCY_HOSPITALS: Omit<HospitalResult, 'distanceKm'>[] = [
  { id: 'dmch', name: 'Dhaka Medical College Hospital (DMCH)', lat: 23.7260, lon: 90.3976, phone: '02-55165088', type: 'medical_college' },
  { id: 'bsmmu', name: 'Bangabandhu Sheikh Mujib Medical University (BSMMU)', lat: 23.7388, lon: 90.3957, phone: '02-55165088', type: 'medical_college' },
  { id: 'square', name: 'Square Hospital Dhaka', lat: 23.7530, lon: 90.3816, phone: '10616', type: 'hospital' },
  { id: 'united', name: 'United Hospital Dhaka', lat: 23.8051, lon: 90.4158, phone: '10666', type: 'hospital' },
  { id: 'kurmitola', name: 'Kurmitola General Hospital', lat: 23.8197, lon: 90.4103, phone: '02-58815222', type: 'hospital' },
  { id: 'rmch', name: 'Rajshahi Medical College Hospital (RMCH)', lat: 24.3707, lon: 88.5831, phone: '0721-772150', type: 'medical_college' },
  { id: 'cmch', name: 'Chattogram Medical College Hospital (CMCH)', lat: 22.3589, lon: 91.8217, phone: '031-2502838', type: 'medical_college' },
  { id: 'smc', name: 'Sylhet MAG Osmani Medical College Hospital', lat: 24.8987, lon: 91.8519, phone: '0821-713336', type: 'medical_college' },
  { id: 'kmch', name: 'Khulna Medical College Hospital', lat: 22.8427, lon: 89.5398, phone: '041-760320', type: 'medical_college' },
];

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getFallbackHospitals(lat: number, lon: number): HospitalResult[] {
  return STATIC_EMERGENCY_HOSPITALS.map((h) => ({
    ...h,
    distanceKm: Math.round(haversineKm(lat, lon, h.lat, h.lon) * 10) / 10,
  })).sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
}

export async function findNearbyHospitals(lat: number, lon: number, radiusMeters = 8000): Promise<HospitalResult[]> {
  const query = `[out:json][timeout:10];(node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});node["amenity"="clinic"](around:${radiusMeters},${lat},${lon}););out center 20;`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const url = `${endpoint}?data=${encodeURIComponent(query)}`;
      const res = await fetch(url, { signal: controller.signal });

      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const data = await res.json();

      if (!data?.elements || !Array.isArray(data.elements)) continue;

      const results: HospitalResult[] = data.elements
        .map((el: any) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLon = el.lon ?? el.center?.lon;
          if (elLat == null || elLon == null) return null;
          return {
            id: String(el.id),
            name: el.tags?.name ?? el.tags?.['name:en'] ?? 'Unnamed facility',
            lat: elLat,
            lon: elLon,
            distanceKm: Math.round(haversineKm(lat, lon, elLat, elLon) * 10) / 10,
            phone: el.tags?.phone ?? el.tags?.['contact:phone'],
            type: el.tags?.amenity === 'clinic' ? 'clinic' : 'hospital',
          } as HospitalResult;
        })
        .filter((h: HospitalResult | null): h is HospitalResult => h !== null)
        .sort((a: HospitalResult, b: HospitalResult) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

      if (results.length > 0) return results;
    } catch {
      continue;
    }
  }

  // Guaranteed fallback to verified referral hospitals with calculated distances
  return getFallbackHospitals(lat, lon);
}
