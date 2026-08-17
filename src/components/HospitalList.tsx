import { useEffect, useState } from 'react';
import type { HospitalResult } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { findNearbyHospitals } from '../services/hospitalLookup';
import { getContactsForDistrict } from '../services/emergencyContacts';

export default function HospitalList({ district, onSelect }: { district?: string; onSelect?: (h: HospitalResult) => void }) {
  const { coords, status } = useGeolocation();
  const [hospitals, setHospitals] = useState<HospitalResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    findNearbyHospitals(coords.lat, coords.lon).then((res) => {
      setHospitals(res);
      setLoading(false);
    });
  }, [coords]);

  const contacts = getContactsForDistrict(district);

  return (
    <div className="space-y-4">
      {coords?.isMock && (
        <p className="text-xs text-clinical-muted">
          Location permission unavailable — showing results near a default location. Enable location for accurate results.
        </p>
      )}
      {loading && <p className="text-sm text-clinical-muted">Searching OpenStreetMap for nearby facilities…</p>}
      {!loading && hospitals.length > 0 && (
        <ul className="space-y-2">
          {hospitals.slice(0, 8).map((h) => (
            <li key={h.id} className="card p-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{h.name}</p>
                <p className="text-xs text-clinical-muted">{h.type === 'hospital' ? 'Hospital' : 'Clinic'} · {h.distanceKm} km away</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <a
                  className="text-xs px-3 py-1.5 rounded-md bg-clinical-accent/15 text-clinical-accent border border-clinical-accent/30"
                  href={`https://www.openstreetmap.org/directions?to=${h.lat},${h.lon}`}
                  target="_blank" rel="noreferrer"
                >
                  Directions
                </a>
                {onSelect && (
                  <button onClick={() => onSelect(h)} className="text-xs px-3 py-1.5 rounded-md bg-clinical-panel2 border border-clinical-border">
                    Select
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {!loading && hospitals.length === 0 && (
        <p className="text-sm text-clinical-muted">No live results found nearby — use these emergency numbers instead:</p>
      )}
      <div className="flex flex-wrap gap-2">
        {contacts.map((c) => (
          <a key={c.label} href={`tel:${c.number}`} className="text-xs px-3 py-1.5 rounded-md bg-clinical-panel2 border border-clinical-border hover:border-clinical-accent">
            {c.label}: <span className="font-mono">{c.number}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
