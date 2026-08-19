import { useState } from 'react';
import { CRITICAL_BANNER_SYMPTOMS } from '../engine/symptomKeywords';
import { NATIONAL_EMERGENCY } from '../services/emergencyContacts';

export default function CriticalBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full bg-rose-50/90 border-b border-rose-200/80 text-xs text-rose-800 transition-all">
      <div className="max-w-5xl mx-auto px-4 py-1.5 flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
        <span className="font-semibold text-rose-700">
          Emergency Warning: If you experience any of these symptoms, call <span className="font-mono font-bold underline">{NATIONAL_EMERGENCY.number}</span> immediately:
        </span>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="ml-auto text-rose-600 hover:text-rose-900 font-semibold underline underline-offset-2 shrink-0"
        >
          {expanded ? 'Hide symptoms' : 'Show list'}
        </button>
      </div>
      {expanded && (
        <div className="max-w-5xl mx-auto px-4 pb-2.5 flex flex-wrap gap-1.5 animate-fade-in">
          {CRITICAL_BANNER_SYMPTOMS.map((s) => (
            <span key={s} className="px-2.5 py-0.5 rounded-full bg-white border border-rose-200 text-rose-700 text-[11px] font-medium shadow-2xs">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
