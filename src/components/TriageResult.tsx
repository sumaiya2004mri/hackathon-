import type { ModuleKind, TriageSession } from '../types';
import VoiceReadout from './VoiceReadout';
import HospitalList from './HospitalList';
import { useAuth } from '../auth/AuthContext';
import { NATIONAL_EMERGENCY } from '../services/emergencyContacts';
import { useLanguage } from '../context/LanguageContext';

const SEVERITY_LABEL: Record<string, { en: string; bn: string }> = {
  EMERGENCY: { en: 'Emergency (Immediate Action)', bn: 'জরুরি (অবিলম্বে জরুরি চিকিৎসা নিন)' },
  URGENT: { en: 'Urgent (See Doctor Today)', bn: 'জরুরি (আজই ডাক্তার দেখান)' },
  MONITOR: { en: 'Monitor (Watch Symptoms)', bn: 'পর্যবেক্ষণ (লক্ষণ পর্যবেক্ষণ করুন)' },
  NORMAL: { en: 'Normal (Expected Variation)', bn: 'স্বাভাবিক (ভয়ের কিছু নেই)' },
};

export default function TriageResult({ session }: { session: TriageSession; module: ModuleKind }) {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const sev = session.finalSeverity;

  const sosNumber = user.emergencyContact?.phone || NATIONAL_EMERGENCY.number;
  const labelObj = SEVERITY_LABEL[sev] ?? SEVERITY_LABEL['MONITOR'];

  return (
    <div className="space-y-4 font-body animate-fade-in">
      {/* One-Click Direct SOS Emergency Call Bar */}
      <div className="p-4 rounded-3xl bg-red-600 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">🚨</span>
          <div>
            <h4 className="font-display font-extrabold text-base">
              {lang === 'bn' ? 'জরুরি ওয়ান-ক্লিক SOS ফোন কল' : 'One-Click Direct SOS Call'}
            </h4>
            <p className="text-xs text-white/90 font-medium">
              {user.emergencyContact
                ? `${t('emergencyContact')}: ${user.emergencyContact.phone} (${user.emergencyContact.relationship})`
                : `National Emergency Service: ${NATIONAL_EMERGENCY.number}`}
            </p>
          </div>
        </div>

        <a
          href={`tel:${sosNumber}`}
          className="px-6 py-2.5 rounded-full bg-white text-red-600 font-extrabold text-xs shadow-md hover:bg-red-50 transition-all shrink-0 active:scale-95 flex items-center gap-1.5"
        >
          <span>📞</span>
          <span>{lang === 'bn' ? 'এখনই কল করুন' : 'Call Now'} ({sosNumber})</span>
        </a>
      </div>

      <div className={`p-5 bg-white rounded-3xl border border-pink-200 border-l-8 shadow-xs`} style={{ borderLeftColor: sev === 'EMERGENCY' ? '#E11D48' : sev === 'URGENT' ? '#EA580C' : sev === 'MONITOR' ? '#D97706' : '#16A34A' }}>
        <div className={`flex items-center gap-2 severity-${sev}`}>
          <span className={`w-3 h-3 rounded-full bg-severity-${sev}`} />
          <span className="font-display font-extrabold text-xl">
            {lang === 'bn' ? labelObj.bn : labelObj.en}
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-800 font-medium leading-relaxed mt-2">{session.recommendation}</p>

        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-pink-100">
          <VoiceReadout text={`${lang === 'bn' ? labelObj.bn : labelObj.en}. ${session.recommendation}`} />
          <span className="text-xs text-slate-500 font-bold">
            Assessed via {session.aiPass ? 'local rules + AI review' : 'local rules only'}
          </span>
        </div>
      </div>

      {session.aiPass && (
        <details className="p-4 bg-white border border-pink-200 rounded-2xl text-xs text-slate-700">
          <summary className="cursor-pointer font-bold text-slate-900">Why this assessment (Clinical rules + AI reasoning)</summary>
          <p className="mt-2"><strong className="text-slate-900">Local pass:</strong> {session.localPass.rationale}</p>
          <p className="mt-1"><strong className="text-slate-900">AI pass:</strong> {session.aiPass.rationale}</p>
        </details>
      )}

      {/* Hospital location & interactive map */}
      <div className="p-5 bg-white border border-pink-200 rounded-3xl shadow-xs">
        <h3 className="font-display font-bold text-slate-900 mb-3 flex items-center gap-2 text-base">
          <span>🏥</span>
          <span>{lang === 'bn' ? 'নিকটস্থ হাসপাতাল ও স্বাস্থ্যকেন্দ্র' : 'Nearest Medical Care & Facilities'}</span>
        </h3>
        <HospitalList district={user.district} />
      </div>
    </div>
  );
}
