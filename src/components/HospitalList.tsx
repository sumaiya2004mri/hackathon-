import { useEffect, useState } from 'react';
import type { HospitalResult } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { findNearbyHospitals } from '../services/hospitalLookup';
import { getContactsForDistrict } from '../services/emergencyContacts';
import Skeleton from './Skeleton';

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
        <p className="text-xs text-ink-soft">
          Location permission unavailable — showing results near a default location. Enable location for accurate results.
        </p>
      )}
      {loading && (
        <div className="space-y-2">
          <Skeleton lines={1} accent="emergency" />
          <Skeleton lines={1} accent="emergency" />
          <Skeleton lines={1} accent="emergency" />
        </div>
      )}
      {!loading && hospitals.length > 0 && (
        <ul className="space-y-2">
          {hospitals.slice(0, 8).map((h) => (
            <li key={h.id} className="card p-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{h.name}</p>
                <p className="text-xs text-ink-muted">{h.type === 'hospital' ? 'Hospital' : 'Clinic'} · {h.distanceKm} km away</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <a
                  className="press text-xs px-3 py-1.5 rounded-full bg-module-emergencyBg text-module-emergency"
                  href={`https://www.openstreetmap.org/directions?to=${h.lat},${h.lon}`}
                  target="_blank" rel="noreferrer"
                >
                  Directions
                </a>
                {onSelect && (
                  <button onClick={() => onSelect(h)} className="press text-xs px-3 py-1.5 rounded-full bg-white border border-cream-border text-ink">
                    Select
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {!loading && hospitals.length === 0 && (
        <p className="text-sm text-ink-muted">No live results found nearby — use these emergency numbers instead:</p>
      )}
      <div className="flex flex-wrap gap-2">
        {contacts.map((c) => (
          <a key={c.label} href={`tel:${c.number}`} className="press text-xs px-3 py-1.5 rounded-full bg-white border border-cream-border text-ink hover:border-module-emergency">
            {c.label}: <span className="font-mono">{c.number}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
