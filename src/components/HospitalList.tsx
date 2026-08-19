import { useEffect, useState } from 'react';
import type { HospitalResult } from '../types';
import { findNearbyHospitals } from '../services/hospitalLookup';
import { useGeolocation } from '../hooks/useGeolocation';
import { getContactsForDistrict } from '../services/emergencyContacts';

interface HospitalListProps {
  district?: string;
  onSelect?: (hospital: HospitalResult) => void;
}

export default function HospitalList({ district, onSelect }: HospitalListProps) {
  const { coords } = useGeolocation();
  const [hospitals, setHospitals] = useState<HospitalResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coords) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    findNearbyHospitals(coords.lat, coords.lon)
      .then((res) => {
        if (isMounted) {
          setHospitals(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [coords]);

  const contacts = getContactsForDistrict(district);

  return (
    <div className="space-y-4">
      {coords?.isMock && (
        <p className="text-xs text-clinical-muted">
          Location permission unavailable — showing results near default location (Dhaka).
        </p>
      )}

      {loading && (
        <p className="text-sm text-clinical-muted">Searching OpenStreetMap for nearby medical facilities…</p>
      )}

      {error && (
        <p className="text-sm text-red-500 font-medium">
          Error searching facilities: {error}
        </p>
      )}

      {!loading && !error && hospitals.length > 0 && (
        <ul className="space-y-2">
          {hospitals.slice(0, 8).map((h, i) => (
            <li
              key={h.id}
              className="card p-3 flex items-center justify-between gap-3 stagger-item card-interactive"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <div>
                <p className="font-semibold text-clinical-text">{h.name}</p>
                <p className="text-xs text-clinical-muted">
                  {h.type === 'hospital' ? 'Hospital' : h.type === 'medical_college' ? 'Medical College' : 'Clinic'}
                  {h.distanceKm !== undefined ? ` · ${h.distanceKm} km away` : ''}
                </p>
                {h.phone && (
                  <p className="text-xs text-clinical-muted font-mono mt-0.5">Phone: {h.phone}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <a
                  className="text-xs px-3 py-1.5 rounded-lg bg-clinical-accent/10 text-clinical-text border border-clinical-border transition-all hover:bg-clinical-accent/25"
                  href={`https://www.openstreetmap.org/directions?to=${h.lat},${h.lon}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Directions
                </a>
                {onSelect && (
                  <button
                    onClick={() => onSelect(h)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-clinical-panel2 border border-clinical-border transition-all hover:bg-clinical-panel hover:text-clinical-text"
                  >
                    Select
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && (error || hospitals.length === 0) && (
        <div className="space-y-2">
          {!error && hospitals.length === 0 && (
            <p className="text-sm text-clinical-muted">No live results found nearby — use these emergency numbers instead:</p>
          )}
          {error && (
            <p className="text-xs text-clinical-muted">Fallback emergency numbers for your district:</p>
          )}
          <div className="flex flex-wrap gap-2">
            {contacts.map((c, i) => (
              <a
                key={c.label}
                href={`tel:${c.number}`}
                className="text-xs px-3 py-1.5 rounded-lg bg-clinical-panel2 border border-clinical-border hover:border-clinical-accent hover:text-clinical-text transition-all stagger-item"
                style={{ animationDelay: `${i * 35}ms` }}
              >
                {c.label}: <span className="font-mono">{c.number}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
