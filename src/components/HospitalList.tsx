import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Clock,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Stethoscope,
  XCircle,
} from "lucide-react";
import type { Hospital, UrgencyLevel } from "../types";
import { MOCK_HOSPITALS } from "../mockData";
import { fetchNearbyHospitals } from "../lib/hospitals";
import { MapModal } from "./MapModal";

interface Props {
  urgency?: UrgencyLevel | null;
  onBack: () => void;
}

export function HospitalList({ urgency, onBack }: Props) {
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(false);
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [usingSampleData, setUsingSampleData] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocation = () => {
    setLocating(true);
    setLocated(false);
    setLocationError(null);

    if (!("geolocation" in navigator)) {
      setLocating(false);
      setLocationError(
        "Your browser doesn't support location access. Showing sample facilities."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const real = await fetchNearbyHospitals(latitude, longitude);
          if (real.length > 0) {
            setHospitals(real);
            setUsingSampleData(false);
          } else {
            setLocationError(
              "No facilities found nearby via OpenStreetMap. Showing sample data."
            );
          }
        } catch {
          setLocationError(
            "Couldn't reach the hospital lookup service. Showing sample data."
          );
        } finally {
          setLocating(false);
          setLocated(true);
        }
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was denied. Showing sample facilities instead."
            : "Couldn't determine your location. Showing sample facilities instead."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const sorted = [...hospitals].sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-blue-900 sm:text-4xl">
          Nearby Hospitals &amp; Facilities
        </h1>
        <p className="mt-2 text-slate-500">
          Find healthcare facilities near you with distance, open status, and
          directions.
        </p>
      </div>

      {/* Location permission */}
      <div className="card mb-6 p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <LocateFixed className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-blue-900">Use Your Location</p>
              <p className="text-sm text-slate-500">
                {located && !usingSampleData
                  ? "Location detected — showing real nearby facilities."
                  : located && usingSampleData
                  ? "Location detected, but live data wasn't available — showing sample facilities."
                  : "Grant location access to find the closest facilities."}
              </p>
              {located && !usingSampleData && (
                <p className="mt-0.5 text-xs text-slate-400">
                  Facility data via OpenStreetMap contributors — hours and
                  phone numbers may be incomplete; call ahead when possible.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={requestLocation}
            disabled={locating}
            className="btn-primary w-full sm:w-auto"
          >
            {locating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Detecting Location…
              </>
            ) : located ? (
              <>
                <LocateFixed className="h-5 w-5" />
                Location Detected
              </>
            ) : (
              <>
                <LocateFixed className="h-5 w-5" />
                Enable Location
              </>
            )}
          </button>
        </div>
      </div>

      {locationError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p>{locationError}</p>
        </div>
      )}

      {usingSampleData && !locationError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p>
            Showing sample facilities. Enable location above to see real
            hospitals and clinics near you.
          </p>
        </div>
      )}

      {/* Urgency hint */}
      {urgency === "HIGH" && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          <Stethoscope className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p>
            Your assessment indicated <strong>high urgency</strong>. Please
            call 911 or go to the nearest emergency room immediately.
          </p>
        </div>
      )}

      {/* Hospital list */}
      <div className="space-y-4">
        {sorted.map((h) => (
          <div
            key={h.id}
            className="card group p-5 transition-all hover:shadow-md hover:border-teal-300"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-blue-900">{h.name}</h3>
                    {h.emergency && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                        ER
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{h.type}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-teal-600" />
                      {h.distanceKm} km away
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {h.open ? (
                        <>
                          <Clock className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="font-medium text-emerald-600">
                            Open now
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium text-slate-400">
                            Closed
                          </span>
                        </>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {h.phone}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{h.address}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(h)}
                className="btn-secondary flex-shrink-0 self-start sm:self-center"
              >
                <Navigation className="h-4 w-4" />
                Get Directions
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <MapModal hospital={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
