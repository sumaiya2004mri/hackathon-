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
  const { coords } = useGeolocation(district);
  const [hospitals, setHospitals] = useState<HospitalResult[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coords) return;

    let isMounted = true;
    setLoading(true);

    findNearbyHospitals(coords.lat, coords.lon)
      .then((res) => {
        if (isMounted) {
          // Sort strictly by distance to user's active location
          const sorted = [...res].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
          // Filter to local nearby facilities (within 60km) unless empty
          const nearbyOnly = sorted.filter((h) => (h.distanceKm ?? 0) <= 60);
          const finalResults = nearbyOnly.length > 0 ? nearbyOnly : sorted.slice(0, 4);

          setHospitals(finalResults);
          if (finalResults.length > 0) {
            setSelectedHospital(finalResults[0]);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [coords]);

  const handleSelectHospital = (h: HospitalResult) => {
    setSelectedHospital(h);
    if (onSelect) onSelect(h);
  };

  const contacts = getContactsForDistrict(district);
  const activeHospital = selectedHospital || hospitals[0];

  return (
    <div className="space-y-4">
      {coords?.isMock && (
        <p className="text-xs text-clinical-muted">
          Showing emergency care facilities near {district || 'your selected location'}. Enable location permissions for exact live coordinates.
        </p>
      )}

      {loading && (
        <p className="text-sm text-clinical-muted animate-pulse">Searching nearby medical facilities and emergency centers…</p>
      )}

      {/* Interactive Map Embed & Navigation Header */}
      {activeHospital && (
        <div className="card p-3 border border-clinical-border space-y-3 bg-clinical-panel/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-clinical-accent">Active Facility Map</span>
              <h4 className="font-semibold text-clinical-text text-base">{activeHospital.name}</h4>
              <p className="text-xs text-clinical-muted">
                {activeHospital.type === 'hospital' ? 'Hospital' : activeHospital.type === 'medical_college' ? 'Medical College' : 'Clinic'}
                {activeHospital.distanceKm !== undefined ? ` · ${activeHospital.distanceKm} km from you` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${activeHospital.lat},${activeHospital.lon}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-sm"
              >
                🧭 Google Maps Navigation
              </a>
              <a
                href={
                  coords
                    ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${coords.lat},${coords.lon};${activeHospital.lat},${activeHospital.lon}`
                    : `https://www.openstreetmap.org/?mlat=${activeHospital.lat}&mlon=${activeHospital.lon}#map=15/${activeHospital.lat}/${activeHospital.lon}`
                }
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-clinical-accent/15 text-clinical-text border border-clinical-border hover:bg-clinical-accent/25 transition-all"
              >
                🗺️ OpenStreetMap Route
              </a>
              {activeHospital.phone && (
                <a
                  href={`tel:${activeHospital.phone}`}
                  className="text-xs px-3 py-1.5 rounded-lg bg-clinical-panel2 border border-clinical-border font-mono hover:text-clinical-text transition-all"
                >
                  📞 {activeHospital.phone}
                </a>
              )}
            </div>
          </div>

          {/* Embedded Interactive Map View */}
          <div className="w-full h-64 rounded-lg overflow-hidden border border-clinical-border relative shadow-inner bg-slate-900/10">
            <iframe
              title={`Map view for ${activeHospital.name}`}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeHospital.lon - 0.015},${activeHospital.lat - 0.015},${activeHospital.lon + 0.015},${activeHospital.lat + 0.015}&layer=mapnik&marker=${activeHospital.lat},${activeHospital.lon}`}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* Hospital List Cards */}
      {hospitals.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-clinical-muted">Nearby Emergency Hospitals & Clinics</h4>
          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {hospitals.map((h) => {
              const isSelected = activeHospital?.id === h.id;
              return (
                <li
                  key={h.id}
                  onClick={() => handleSelectHospital(h)}
                  className={`card p-3 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected ? 'border-clinical-accent bg-clinical-accent/10 shadow-sm' : 'hover:border-clinical-border/80'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-clinical-text text-sm">{h.name}</p>
                    <p className="text-xs text-clinical-muted">
                      {h.type === 'hospital' ? 'Hospital' : h.type === 'medical_college' ? 'Medical College' : 'Clinic'}
                      {h.distanceKm !== undefined ? ` · ${h.distanceKm} km from you` : ''}
                    </p>
                    {h.phone && <p className="text-xs text-clinical-muted font-mono mt-0.5">Phone: {h.phone}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectHospital(h);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-clinical-accent text-white border-clinical-accent font-medium'
                          : 'bg-clinical-panel2 border-clinical-border hover:bg-clinical-panel hover:text-clinical-text'
                      }`}
                    >
                      {isSelected ? 'Viewing on Map' : 'View on Map'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Emergency Contacts Bar */}
      <div className="pt-2 border-t border-clinical-border/50 space-y-2">
        <p className="text-xs text-clinical-muted font-medium">National & District Emergency Contacts:</p>
        <div className="flex flex-wrap gap-2">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={`tel:${c.number}`}
              className="text-xs px-3 py-1.5 rounded-lg bg-clinical-panel2 border border-clinical-border hover:border-clinical-accent hover:text-clinical-text transition-all"
            >
              {c.label}: <span className="font-mono font-bold">{c.number}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
