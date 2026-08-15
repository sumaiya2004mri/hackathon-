import type { Hospital } from "../types";

// Overpass API (OpenStreetMap) — free, no API key, no billing.
// The public de.overpass instance is a shared free resource that's
// frequently overloaded or rate-limited, so we try a few known mirrors
// in order and use whichever responds first.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

/**
 * Fetches real hospitals/clinics near a coordinate using the free,
 * keyless Overpass API (OpenStreetMap data).
 */
export async function fetchNearbyHospitals(
  lat: number,
  lng: number,
  radiusMeters = 8000
): Promise<Hospital[]> {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
    );
    out center tags;
  `;

  let lastError: unknown = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: query,
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        lastError = new Error(`Overpass API error: ${res.status}`);
        continue; // try next mirror
      }

      const data: { elements: OverpassElement[] } = await res.json();
      const hospitals = parseOverpassElements(data.elements, lat, lng);
      if (hospitals.length > 0) return hospitals;
      // Empty result is valid (genuinely nothing nearby) — don't retry other mirrors.
      return hospitals;
    } catch (err) {
      lastError = err;
      continue; // network error / timeout — try next mirror
    }
  }

  throw lastError ?? new Error("All Overpass mirrors failed");
}

function parseOverpassElements(
  elements: OverpassElement[],
  lat: number,
  lng: number
): Hospital[] {
  return elements
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (elLat == null || elLng == null) return null;

      const tags = el.tags ?? {};
      const name = tags.name ?? "Unnamed Medical Facility";
      const amenity = tags.amenity;
      const isHospital = amenity === "hospital";

      const addressParts = [
        tags["addr:housenumber"],
        tags["addr:street"],
        tags["addr:city"],
      ].filter(Boolean);

      const hospital: Hospital = {
        id: String(el.id),
        name,
        type: isHospital ? "Hospital" : "Clinic",
        distanceKm:
          Math.round(haversineKm(lat, lng, elLat, elLng) * 10) / 10,
        open: true, // OSM opening_hours parsing is unreliable; assume open, tell user to call ahead
        address:
          addressParts.length > 0
            ? addressParts.join(", ")
            : "Address unavailable — open in Maps for details",
        phone: tags.phone ?? tags["contact:phone"] ?? "Not listed",
        emergency: isHospital,
      };
      return hospital;
    })
    .filter((h): h is Hospital => h !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 15);
}
