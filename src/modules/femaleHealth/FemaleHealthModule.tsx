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
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div className="card p-6 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-3xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
            Educational Guidance
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Your Women's Health</h1>
          <p className="text-sm opacity-90 leading-relaxed font-light">
            Understand your body, track changes, and know when it's time to seek professional care.
          </p>
        </div>
      </div>

      {/* Safety Disclaimer Strip */}
      <div className="p-3.5 rounded-2xl bg-maternal-blush border border-maternal-border text-xs text-maternal-muted flex items-center gap-2">
        <span className="text-maternal-primary font-bold text-base">ℹ️</span>
        <span>
          This section is educational and helps route you to the right level of care — it does not diagnose any condition.
        </span>
      </div>

      {/* Topics Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {TOPICS.map((t) => (
          <div
            key={t.title}
            className="card p-5 bg-white border border-maternal-border rounded-2xl space-y-3 hover:border-maternal-primary/50 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xl p-2 rounded-xl bg-maternal-blush border border-maternal-border">{t.icon}</span>
                <h3 className="font-display font-semibold text-maternal-primary text-base">{t.title}</h3>
              </div>
              <p className="text-xs text-maternal-muted leading-relaxed">{t.body}</p>
            </div>
            <button className="text-xs font-semibold text-maternal-primary hover:underline text-left pt-1">
              {t.actionText}
            </button>
          </div>
        ))}
      </div>

      {/* Prominent Symptom Check Section */}
      <div className="card p-6 bg-white border border-maternal-border rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-lg text-maternal-text">Not feeling like yourself?</h2>
            <p className="text-xs text-maternal-muted">
              Use our symptom check to understand the appropriate level of care. Runs through local clinical rules + AI triage.
            </p>
          </div>
          {!showCheck && (
            <button
              onClick={() => setShowCheck(true)}
              className="px-5 py-2.5 rounded-full bg-maternal-primary hover:bg-maternal-hover text-white text-xs font-semibold shadow-sm transition-all shrink-0"
            >
              Start symptom check
            </button>
          )}
        </div>

        {showCheck && (
          <div className="pt-3 border-t border-maternal-border">
            <TriageForm module="female_health" />
          </div>
        )}
      </div>
    </div>
  );
}
