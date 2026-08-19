import { useState } from 'react';
import TriageForm from '../../components/TriageForm';

const TOPICS = [
  {
    icon: '🩺',
    title: 'UTIs (urinary tract infections)',
    body: 'Common signs include burning during urination, needing to urinate often, and lower belly discomfort. Drinking water and urinating after intimacy can help prevent them. If you also have fever or back pain, prompt medical review is recommended.',
    actionText: 'Learn more →',
  },
  {
    icon: '🌸',
    title: 'Menstrual disorders',
    body: 'Cycles that are consistently very heavy, very painful, or highly unpredictable are worth discussing with a doctor — our Period module can help you track patterns to bring to your consultation.',
    actionText: 'Track patterns →',
  },
  {
    icon: '🧬',
    title: 'PCOS / PCOD indicators',
    body: 'Irregular periods, acne, excess hair growth, and weight changes can sometimes be associated with PCOS/PCOD. This is informational only — a physician can evaluate with blood tests and ultrasound.',
    actionText: 'Learn about symptoms →',
  },
  {
    icon: '🎗️',
    title: 'Breast health self-checks',
    body: 'A monthly self-check a few days after your period ends helps you learn what is normal for you. Consult a doctor promptly for any new lump, dimpling, unusual discharge, or persistent pain.',
    actionText: 'Self-check guide →',
  },
];

export default function FemaleHealthModule() {
  const [showCheck, setShowCheck] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Solid Pink Hero Container Box (Ensuring White Text is Crystal Clear) */}
      <div 
        className="p-6 md:p-8 text-white rounded-3xl shadow-md space-y-3"
        style={{ backgroundColor: '#E85A91' }}
      >
        <span className="inline-block px-3.5 py-1 rounded-full bg-white/25 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
          EDUCATIONAL GUIDANCE
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">Your Women's Health</h1>
        <p className="text-sm md:text-base text-white font-medium leading-relaxed max-w-2xl">
          Understand your body, track changes, and know when it's time to seek professional care.
        </p>
      </div>

      {/* Safety Disclaimer Strip */}
      <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 text-xs text-slate-900 font-bold flex items-center gap-2.5">
        <span className="text-[#E85A91] font-extrabold text-base">ℹ️</span>
        <span>
          This section is educational and helps route you to the right level of care — it does not diagnose any condition.
        </span>
      </div>

      {/* Topics Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {TOPICS.map((t) => (
          <div
            key={t.title}
            className="p-5 bg-white border border-pink-200 rounded-2xl space-y-3 hover:border-[#E85A91] transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xl p-2 rounded-xl bg-pink-50 border border-pink-200">{t.icon}</span>
                <h3 className="font-display font-bold text-[#E85A91] text-base">{t.title}</h3>
              </div>
              <p className="text-xs text-slate-900 font-medium leading-relaxed">{t.body}</p>
            </div>
            <button className="text-xs font-bold text-[#E85A91] hover:underline text-left pt-1">
              {t.actionText}
            </button>
          </div>
        ))}
      </div>

      {/* Prominent Symptom Check Section */}
      <div className="p-6 bg-white border border-pink-200 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-lg text-slate-900">Not feeling like yourself?</h2>
            <p className="text-xs text-slate-800 font-medium">
              Use our symptom check to understand the appropriate level of care. Runs through local clinical rules + AI triage.
            </p>
          </div>
          {!showCheck && (
            <button
              onClick={() => setShowCheck(true)}
              className="px-5 py-2.5 rounded-full bg-[#E85A91] hover:bg-[#D4437B] text-white text-xs font-bold shadow-md transition-all shrink-0"
            >
              Start symptom check
            </button>
          )}
        </div>

        {showCheck && (
          <div className="pt-3 border-t border-pink-200">
            <TriageForm module="female_health" />
          </div>
        )}
      </div>
    </div>
  );
}
