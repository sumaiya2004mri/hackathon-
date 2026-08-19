import { useState } from 'react';
import { CRITICAL_BANNER_SYMPTOMS } from '../engine/symptomKeywords';
import { NATIONAL_EMERGENCY } from '../services/emergencyContacts';
import { useLanguage } from '../context/LanguageContext';

export default function CriticalBanner() {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="w-full bg-rose-50/90 border-b border-rose-200/80 text-xs text-rose-800 transition-all font-body">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
        <span className="font-semibold text-rose-700">
          {t('emergencyWarning')} <span className="font-mono font-bold underline text-rose-900">{NATIONAL_EMERGENCY.number}</span> {t('callNow')}
        </span>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="ml-auto text-rose-600 hover:text-rose-900 font-bold underline underline-offset-2 shrink-0"
        >
          {expanded ? t('hideSymptoms') : t('showList')}
        </button>
      </div>
      {expanded && (
        <div className="max-w-5xl mx-auto px-4 pb-2.5 flex flex-wrap gap-1.5 animate-fade-in">
          {CRITICAL_BANNER_SYMPTOMS.map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-full bg-white border border-rose-200 text-rose-800 text-[11px] font-bold shadow-2xs">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
