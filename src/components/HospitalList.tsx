import { useState } from 'react';
import { findNearbyHospitals } from './findNearbyHospitals'; // 1. name must match the actual export
import { HospitalResult } from '../types';

export function useHospitalSearch() {
  const [hospitals, setHospitals] = useState<HospitalResult[]>([]); // 2. typed, was implicit any[]
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleHospitalSearch = async (lat: number, lon: number) => {
    setLoading(true);
    setErrorMessage(''); // Clear old errors

    try {
      const results = await findNearbyHospitals(lat, lon);
      setHospitals(results);

      if (results.length === 0) {
        setErrorMessage('No hospitals found within your immediate radius.');
      }
    } catch (error: unknown) {
      // 3. narrow unknown instead of trusting `any`
      const message =
        error instanceof Error ? error.message : 'Network timeout. Map services are currently unavailable.';
      setErrorMessage(message);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  return { hospitals, loading, errorMessage, handleHospitalSearch };
}

export function HospitalSearchPanel({ lat, lon }: { lat: number; lon: number }) {
  const { hospitals, loading, errorMessage, handleHospitalSearch } = useHospitalSearch();

  return (
    <div>
      <button onClick={() => handleHospitalSearch(lat, lon)} disabled={loading}>
        {loading ? 'Searching…' : 'Find nearby hospitals'}
      </button>

      {loading && <p role="status">Searching medical registries...</p>}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md my-2" role="alert">
          ⚠️ {errorMessage}
        </div>
      )}

      {hospitals.map((hospital) => (
        // 4. hospital.name, not hospital.tags.name — HospitalResult is a flat
        // object (see findNearbyHospitals.ts), it has no nested `tags` field.
        // The fallback name is already applied when the results are built,
        // but a defensive `||` is kept here in case that ever changes.
        <div key={hospital.id}>
          {hospital.name || 'Unnamed Medical Center'}
          {typeof hospital.distance === 'number' && (
            <span> — {hospital.distance.toFixed(1)} km</span>
          )}
        </div>
      ))}
    </div>
  );
}
