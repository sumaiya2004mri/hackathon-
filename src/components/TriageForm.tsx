import { useState } from 'react';
import type { ModuleKind, TriageSession } from '../types';
import { runTriage } from '../engine/triageOrchestrator';
import { useAuth } from '../auth/AuthContext';
import { useGeminiConfig } from '../hooks/useGeminiConfig';
import { useLanguage } from '../context/LanguageContext';
import { saveSession } from '../engine/sessionStore';
import TriageResult from './TriageResult';

const MODULE_PLACEHOLDER: Record<ModuleKind, { en: string; bn: string }> = {
  general: {
    en: 'Describe your symptoms — e.g. "severe headache and high fever" or "sharp pain since morning"',
    bn: 'আপনার শারীরিক সমস্যা লিখুন — যেমন: "প্রচণ্ড মাথাব্যথা ও তেজ জ্বর" বা "সকাল থেকে পেটে তীব্র ব্যথা"',
  },
  pregnancy: {
    en: 'Describe your symptom — e.g. "severe headache and blurry vision" or "haven\'t felt baby movement"',
    bn: 'গর্ভাবস্থার লক্ষণ লিখুন — যেমন: "প্রচণ্ড মাথাব্যথা ও চোখে ঝাপসা দেখা" বা "আজ বাচ্চার নড়াচড়া কম অনুভূত হচ্ছে"',
  },
  period: {
    en: 'Describe your symptom — e.g. "very heavy bleeding" or "severe pelvic cramps not relieved by medicine"',
    bn: 'পিরিয়ডের সমস্যা লিখুন — যেমন: "অতিরিক্ত রক্তস্রাব" বা "ঔষধেও পেট ব্যথা কমছে না"',
  },
  female_health: {
    en: 'Describe your symptom — e.g. "burning sensation when urinating for two days"',
    bn: 'নারী স্বাস্থ্যের সমস্যা লিখুন — যেমন: "দুই দিন ধরে প্রস্রাবে প্রচণ্ড জ্বালাপোড়া"',
  },
};

export default function TriageForm({ module, onSession }: { module: ModuleKind; onSession?: (s: TriageSession) => void }) {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const geminiConfig = useGeminiConfig();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<TriageSession | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    const result = await runTriage({
      userId: user.id,
      user,
      symptomEntryId: crypto.randomUUID(),
      freeText: text,
      module,
      geminiConfig,
    });
    setSession(result);
    saveSession(user.id, result);
    onSession?.(result);
    setLoading(false);
  }

  const placeholderObj = MODULE_PLACEHOLDER[module] ?? MODULE_PLACEHOLDER.general;

  return (
    <div className="space-y-4 font-body">
      {/* Background Medical History Indicator */}
      {user.medicalHistoryText && (
        <div className="p-3 rounded-2xl bg-pink-50 border border-pink-200 text-xs text-slate-900 font-bold flex items-center justify-between">
          <span>🩺 {lang === 'bn' ? 'ব্যক্তিগত মেডিকেল ইতিহাস যুক্ত আছে:' : 'Cross-referencing Medical History:'} {user.medicalHistoryText}</span>
          <span className="text-[10px] text-[#E85A91] uppercase tracking-wider font-extrabold font-mono">Active</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={lang === 'bn' ? placeholderObj.bn : placeholderObj.en}
          rows={3}
          className="w-full bg-pink-50/50 border border-pink-200 rounded-2xl p-3.5 text-xs md:text-sm text-slate-900 font-bold placeholder:text-slate-500 focus:outline-none focus:border-[#E85A91] transition-all shadow-xs"
        />
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="px-6 py-3 rounded-full bg-[#E85A91] hover:bg-[#D4437B] text-white font-bold text-xs transition-all shadow-md disabled:opacity-40"
          >
            {loading ? t('loading') : (lang === 'bn' ? 'উপসর্গ মূল্যায়ন করুন (AI ট্রায়াজ)' : 'Evaluate Symptoms (AI Triage)')}
          </button>
        </div>
      </form>
      {session && <TriageResult session={session} module={module} />}
    </div>
  );
}
