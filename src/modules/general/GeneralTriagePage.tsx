import { useState } from 'react';
import type { TriageSession } from '../../types';
import TriageForm from '../../components/TriageForm';
import { exportSBARPassport, downloadBlob } from '../../export/exportEngine';
import { useAuth } from '../../auth/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function GeneralTriagePage() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [session, setSession] = useState<TriageSession | null>(null);

  return (
    <div className="space-y-6 font-body animate-fade-in">
      <div className="bg-white p-6 rounded-3xl border border-pink-200 shadow-xs space-y-1">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900">
          {lang === 'bn' ? 'জরুরি মূল্যায়ন (ট্রায়াজ)' : 'Emergency Triage'}
        </h1>
        <p className="text-xs md:text-sm text-slate-700 font-medium">
          {lang === 'bn'
            ? 'আপনার শারীরিক লক্ষণ বা অস্বস্তির কথা বিস্তারিত লিখুন। এটি তাৎক্ষণিকভাবে কাজ করে — জরুরি প্রয়োজনে কোনো লগইনের প্রয়োজন নেই।'
            : 'Describe your symptoms below. This works instantly — no login required, ever, for emergencies.'}
        </p>
      </div>

      <TriageForm module="general" onSession={setSession} />

      {session && (
        <button
          onClick={() => downloadBlob(exportSBARPassport(session, user), 'sbar-passport.pdf')}
          className="text-xs px-4 py-2 rounded-full bg-pink-50 border border-pink-300 text-[#E85A91] font-bold hover:bg-pink-100 transition-all shadow-xs"
        >
          📄 {lang === 'bn' ? 'SBAR পাসপোর্ট ডাউনলোড করুন (ডাক্তারকে দেখানোর জন্য)' : 'Download SBAR passport (bring this to a doctor)'}
        </button>
      )}
    </div>
  );
}
