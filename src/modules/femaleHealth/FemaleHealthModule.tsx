import { useState } from 'react';
import TriageForm from '../../components/TriageForm';

const TOPICS = [
  {
    title: 'UTIs (urinary tract infections)',
    body: 'Common signs include burning during urination, needing to urinate often, and lower belly discomfort. Drinking water and urinating after intimacy can help prevent them. If you also have fever or back pain, that needs prompt medical review.',
  },
  {
    title: 'Menstrual disorders',
    body: 'Cycles that are consistently very heavy, very painful, or highly unpredictable are worth discussing with a doctor — this app\'s Period module can help you track patterns to bring to that conversation.',
  },
  {
    title: 'PCOS / PCOD indicators',
    body: 'Irregular periods, acne, excess hair growth, and weight changes can sometimes be associated with PCOS/PCOD. This is informational only — a doctor can properly evaluate with blood tests and ultrasound.',
  },
  {
    title: 'Breast health self-checks',
    body: 'A monthly self-check a few days after your period ends helps you learn what\'s normal for you. See a doctor promptly for any new lump, dimpling, unusual discharge, or persistent pain.',
  },
];

export default function FemaleHealthModule() {
  const [showCheck, setShowCheck] = useState(false);

  return (
    <div className="space-y-5">
      <div className="card p-4 text-sm text-clinical-muted">
        This section is educational and helps route you to the right level of care — it does not diagnose any condition.
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TOPICS.map((t) => (
          <div key={t.title} className="card p-4">
            <h3 className="font-medium">{t.title}</h3>
            <p className="text-sm text-clinical-muted mt-1">{t.body}</p>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h2 className="font-display font-semibold text-lg mb-1">Check a symptom</h2>
        <p className="text-xs text-clinical-muted mb-3">Runs through the same local-rule + AI triage engine. Anything urgent routes into hospital lookup automatically.</p>
        {!showCheck ? (
          <button onClick={() => setShowCheck(true)} className="text-sm px-4 py-2 rounded-md bg-clinical-panel2 border border-clinical-border">
            Start symptom check
          </button>
        ) : (
          <TriageForm module="female_health" />
        )}
      </div>
    </div>
  );
}
