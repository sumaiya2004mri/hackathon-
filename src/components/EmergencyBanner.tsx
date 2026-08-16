import { Phone } from "lucide-react";

export function EmergencyBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-red-600 bg-red-600 text-white shadow-lg ${
        compact ? "px-4 py-3" : "px-6 py-5"
      }`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-white/10" />
      <div className="relative flex items-center gap-4">
        <span className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-white/30" />
          <Phone className="h-6 w-6" />
        </span>
        <div>
          <p className={`font-bold ${compact ? "text-base" : "text-lg"}`}>
            If this is a life-threatening emergency, call 999 immediately.
          </p>
          {!compact && (
            <p className="mt-1 text-sm text-red-100">
              Do not wait for this tool. Emergency services can dispatch an
              ambulance and provide life-saving instructions over the phone.
            </p>
          )}
        </div>
        <a
          href="tel:999"
          className="ml-auto hidden flex-shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-red-600 shadow-sm transition-transform hover:scale-105 active:scale-95 sm:inline-flex"
        >
          <Phone className="h-4 w-4" />
          Call 999
        </a>
      </div>
    </div>
  );
}
