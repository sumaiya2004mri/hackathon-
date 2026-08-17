import { useState } from 'react';
import { CRITICAL_BANNER_SYMPTOMS } from '../engine/symptomKeywords';
import { NATIONAL_EMERGENCY } from '../services/emergencyContacts';

// This banner is rendered once, at the App shell level, ABOVE the router
// outlet — never inside a module page — so it is guaranteed visible on
// every screen, logged in or guest, regardless of which module is open.
export default function CriticalBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full bg-severity-EMERGENCY/10 border-b border-severity-EMERGENCY/40 text-sm">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-severity-EMERGENCY pulse-emergency shrink-0" />
        <span className="font-medium text-severity-EMERGENCY">If you have any of these, call {NATIONAL_EMERGENCY.number} now:</span>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="ml-auto text-clinical-muted hover:text-clinical-text underline underline-offset-2 shrink-0"
        >
          {expanded ? 'Hide list' : 'Show list'}
        </button>
      </div>
      {expanded && (
        <div className="max-w-5xl mx-auto px-4 pb-3 flex flex-wrap gap-2">
          {CRITICAL_BANNER_SYMPTOMS.map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-full bg-clinical-panel border border-clinical-border text-clinical-text text-xs">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
