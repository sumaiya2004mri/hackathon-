import { PhoneCall } from "lucide-react";

const CRITICAL_SIGNS = [
  "Chest pain or pressure",
  "Difficulty breathing or can't speak in full sentences",
  "Sudden confusion, weakness, or slurred speech",
  "Unconsciousness or unresponsiveness",
  "Severe, uncontrolled bleeding",
  "Suspected stroke or seizure",
];

/**
 * Static, zero-latency safety net: this never depends on the AI or the
 * network, so it's the one thing in the app that's still instantly correct
 * even if everything else is offline or slow.
 */
export function CriticalAlertBanner() {
  return (
    <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
      <div className="mb-2 flex items-center gap-2">
        <PhoneCall className="h-5 w-5 text-red-600" />
        <h3 className="font-bold text-red-800">
          Call 999 immediately if you notice:
        </h3>
      </div>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-red-700 sm:grid-cols-2">
        {CRITICAL_SIGNS.map((sign) => (
          <li key={sign} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
            {sign}
          </li>
        ))}
      </ul>
      <a
        href="tel:999"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-red-700 hover:underline"
      >
        <PhoneCall className="h-4 w-4" />
        Call 999 now
      </a>
    </div>
  );
}
