import { useEffect } from "react";
import { MapPin, X, Navigation, Phone } from "lucide-react";
import type { Hospital } from "../types";

interface Props {
  hospital: Hospital;
  onClose: () => void;
}

export function MapModal({ hospital, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-slide-up">
        {/* Mock map header */}
        <div className="relative h-44 bg-gradient-to-br from-teal-100 via-blue-100 to-emerald-50">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition-colors hover:bg-white hover:text-slate-900"
            aria-label="Close map"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Mock map grid */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Mock roads */}
          <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 bg-white/60" />
          <div className="absolute bottom-0 left-1/3 top-0 w-2 bg-white/60" />
          {/* Pin */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <span className="absolute -inset-3 animate-pulse-ring rounded-full bg-red-500/30" />
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                <MapPin className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-blue-900">{hospital.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{hospital.type}</p>
          <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" />
            {hospital.address}
          </p>
          <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-600">
            <Phone className="h-4 w-4 flex-shrink-0 text-teal-600" />
            {hospital.phone}
          </p>

          <div className="mt-5 flex gap-3">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                hospital.name + " " + hospital.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1"
            >
              <Navigation className="h-5 w-5" />
              Open in Google Maps
            </a>
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
