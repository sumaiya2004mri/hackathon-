import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PeriodLog } from '../../types';
import { useAuth } from '../../auth/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { computeCycleStats } from './cycleStats';
import { exportPeriodCSV, exportPeriodReportPDF, downloadBlob } from '../../export/exportEngine';
import TriageForm from '../../components/TriageForm';

const STORAGE_KEY = 'ea_period_logs';

function loadLogs(userId: string): PeriodLog[] {
  const raw = localStorage.getItem(`${STORAGE_KEY}:${userId}`);
  return raw ? JSON.parse(raw) : [];
}
function saveLogs(userId: string, logs: PeriodLog[]) {
  localStorage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(logs));
}

const FLOW_TRANSLATION: Record<'en' | 'bn', Record<string, string>> = {
  en: { light: 'Light Flow', medium: 'Medium Flow', heavy: 'Heavy Flow' },
  bn: { light: 'হালকা রক্তস্রাব', medium: 'মাঝারি রক্তস্রাব', heavy: 'অতিরিক্ত রক্তস্রাব' },
};

export default function PeriodModule() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<PeriodLog[]>(() => loadLogs(user.id));
  const [showSymptomCheck, setShowSymptomCheck] = useState(false);

  const [form, setForm] = useState({ start: '', end: '', flow: 'medium' as PeriodLog['flowIntensity'], symptoms: '', mood: '' });

  useEffect(() => saveLogs(user.id, logs), [logs, user.id]);

  const stats = useMemo(() => computeCycleStats(logs), [logs]);

  function addLog(e: React.FormEvent) {
    e.preventDefault();
    if (!form.start) return;
    const newLog: PeriodLog = {
      id: crypto.randomUUID(),
      userId: user.id,
      cycleStartDate: form.start,
      cycleEndDate: form.end || undefined,
      flowIntensity: form.flow,
      symptoms: form.symptoms ? form.symptoms.split(',').map((s) => s.trim()).filter(Boolean) : [],
      mood: form.mood || undefined,
      createdAt: new Date().toISOString(),
    };
    setLogs((l) => [...l, newLog]);
    setForm({ start: '', end: '', flow: 'medium', symptoms: '', mood: '' });
  }

  const flowMap = FLOW_TRANSLATION[lang] ?? FLOW_TRANSLATION.en;

  return (
    <div className="space-y-6 font-body animate-fade-in">
      {/* Log a cycle form */}
      <section className="p-6 bg-white border border-pink-200 rounded-3xl shadow-sm space-y-4">
        <h2 className="font-display font-extrabold text-2xl text-slate-900">{t('logCycle')}</h2>
        <form onSubmit={addLog} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-xs md:text-sm font-bold text-slate-700 block">
            {t('startDate')} <span className="text-red-500">*</span>
            <input
              type="date"
              required
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
              className="w-full mt-1 bg-pink-50/60 border border-pink-200 rounded-xl p-3 text-xs md:text-sm text-slate-900 font-bold focus:outline-none focus:border-[#E85A91] transition-all"
            />
          </label>

          <label className="text-xs md:text-sm font-bold text-slate-700 block">
            {t('endDate')}
            <input
              type="date"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
              className="w-full mt-1 bg-pink-50/60 border border-pink-200 rounded-xl p-3 text-xs md:text-sm text-slate-900 font-bold focus:outline-none focus:border-[#E85A91] transition-all"
            />
          </label>

          <label className="text-xs md:text-sm font-bold text-slate-700 block">
            {t('flow')}
            <select
              value={form.flow}
              onChange={(e) => setForm({ ...form, flow: e.target.value as any })}
              className="w-full mt-1 bg-pink-50/60 border border-pink-200 rounded-xl p-3 text-xs md:text-sm text-slate-900 font-bold focus:outline-none focus:border-[#E85A91] transition-all"
            >
              <option value="light">{lang === 'bn' ? 'হালকা (Light)' : 'Light'}</option>
              <option value="medium">{lang === 'bn' ? 'মাঝারি (Medium)' : 'Medium'}</option>
              <option value="heavy">{lang === 'bn' ? 'অতিরিক্ত (Heavy)' : 'Heavy'}</option>
            </select>
          </label>

          <label className="text-xs md:text-sm font-bold text-slate-700 block">
            {t('mood')}
            <input
              value={form.mood}
              onChange={(e) => setForm({ ...form, mood: e.target.value })}
              placeholder={lang === 'bn' ? 'যেমন: আনন্দিত, ক্লান্ত, মেজাজ খিটখিটে' : 'e.g. happy, tired, moody'}
              className="w-full mt-1 bg-pink-50/60 border border-pink-200 rounded-xl p-3 text-xs md:text-sm text-slate-900 font-bold focus:outline-none focus:border-[#E85A91] transition-all"
            />
          </label>

          <label className="text-xs md:text-sm font-bold text-slate-700 block md:col-span-2">
            {t('symptomsLabel')}
            <input
              value={form.symptoms}
              onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
              placeholder={lang === 'bn' ? 'যেমন: পেটে কামড়ানি, পেট ফোলা, দুর্বলতা' : 'e.g. cramps, bloating, fatigue'}
              className="w-full mt-1 bg-pink-50/60 border border-pink-200 rounded-xl p-3 text-xs md:text-sm text-slate-900 font-bold focus:outline-none focus:border-[#E85A91] transition-all"
            />
          </label>

          <button
            type="submit"
            className="md:col-span-2 px-6 py-3.5 mt-2 rounded-full bg-[#E85A91] hover:bg-[#D4437B] text-white font-bold text-xs md:text-sm transition-all shadow-md active:scale-[0.99]"
          >
            {t('saveCycleLog')}
          </button>
        </form>
      </section>

      {/* Cycle stats card */}
      {logs.length > 0 && (
        <section className="p-6 bg-white border border-pink-200 rounded-3xl shadow-sm space-y-4 animate-fade-in">
          <h2 className="font-display font-extrabold text-2xl text-slate-900">{t('cycleStats')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Stat label={t('avgCycleLength')} value={`${stats.averageCycleLengthDays} ${lang === 'bn' ? 'দিন' : 'days'}`} />
            <Stat label={t('avgPeriodLength')} value={`${stats.averagePeriodLengthDays} ${lang === 'bn' ? 'দিন' : 'days'}`} />
            <Stat label={t('predictedNextStart')} value={stats.predictedNextStart} />
            <Stat label={t('predictedFertileWindow')} value={`${stats.predictedFertileWindow[0]} – ${stats.predictedFertileWindow[1]}`} />
          </div>

          {stats.irregularityNote && (
            <p className="mt-4 text-xs md:text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 font-bold">
              {stats.irregularityNote}
            </p>
          )}

          {stats.isLate && (
            <div className="mt-4 text-xs md:text-sm bg-pink-50 border border-pink-200 text-slate-900 rounded-2xl p-4 font-medium space-y-2">
              <p className="font-bold text-slate-900">
                {lang === 'bn'
                  ? `আপনার পিরিয়ড স্বাভাবিক সময়ের থেকে ${stats.daysLate} দিন দেরিতে হচ্ছে। এটি মানসিক চাপ, ভ্রমণ বা শারীরিক কারণে হতে পারে।`
                  : `Your period is ${stats.daysLate} day(s) later than usual pattern.`}
              </p>
              <button
                onClick={() => navigate('/pregnancy')}
                className="text-xs font-bold px-4 py-2 rounded-full bg-[#E85A91] text-white transition-all hover:bg-[#D4437B]"
              >
                {lang === 'bn' ? 'গর্ভাবস্থা ট্র্যাকিং দেখুন →' : 'Set up pregnancy tracking →'}
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-4 border-t border-pink-100 pt-4">
            <button
              onClick={() => downloadBlob(exportPeriodCSV(logs), 'period-history.csv')}
              className="text-xs font-bold px-4 py-2 rounded-full bg-pink-50 border border-pink-200 text-slate-900 hover:bg-pink-100 transition-all"
            >
              📄 {lang === 'bn' ? 'CSV ফাইল ডাউনলোড করুন' : 'Export CSV'}
            </button>
            <button
              onClick={() => downloadBlob(exportPeriodReportPDF(logs, stats, user), 'period-summary.pdf')}
              className="text-xs font-bold px-4 py-2 rounded-full bg-pink-50 border border-pink-200 text-slate-900 hover:bg-pink-100 transition-all"
            >
              📄 {lang === 'bn' ? 'ডাক্তারের উপযোগী PDF রিপোর্ট' : 'Export doctor-shareable PDF'}
            </button>
          </div>
        </section>
      )}

      {/* Symptom Checker entry point */}
      <section className="p-6 bg-white border border-pink-200 rounded-3xl shadow-sm space-y-3 animate-fade-in">
        <h2 className="font-display font-extrabold text-xl text-slate-900">{t('isSomethingWrong')}</h2>
        <p className="text-xs md:text-sm text-slate-600 font-medium">{t('periodSymptomSub')}</p>
        {!showSymptomCheck ? (
          <button
            onClick={() => setShowSymptomCheck(true)}
            className="text-xs md:text-sm font-bold px-5 py-2.5 rounded-full bg-pink-50 border border-pink-200 text-[#E85A91] hover:bg-pink-100 transition-all"
          >
            {t('checkPeriodSymptom')}
          </button>
        ) : (
          <TriageForm module="period" />
        )}
      </section>

      {/* History section */}
      <section className="p-6 bg-white border border-pink-200 rounded-3xl shadow-sm space-y-4 animate-fade-in">
        <h2 className="font-display font-extrabold text-2xl text-slate-900">{t('history')}</h2>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-pink-100 border border-pink-300 flex items-center justify-center text-2xl text-[#E85A91]">
              🌸
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base">{t('noPeriodLogs')}</h3>
            </div>
          </div>
        ) : (
          <ul className="space-y-3 text-xs md:text-sm text-slate-700 font-medium">
            {[...logs].reverse().map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-pink-50/60 border border-pink-200"
              >
                <div>
                  <span className="font-extrabold text-slate-900">{l.cycleStartDate}</span>
                  <span className="mx-2 text-slate-400">→</span>
                  <span className={l.cycleEndDate ? 'font-bold text-slate-900' : 'italic text-[#E85A91] font-bold'}>
                    {l.cycleEndDate ?? (lang === 'bn' ? 'চলমান' : 'ongoing')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-pink-100 text-[#E85A91] text-xs px-3 py-1 rounded-full border border-pink-200 font-bold">
                    {flowMap[l.flowIntensity] ?? l.flowIntensity}
                  </span>
                  {l.symptoms.length > 0 && (
                    <span className="bg-white text-slate-700 text-xs px-3 py-1 rounded-full border border-pink-200 font-bold">
                      {l.symptoms.join(', ')}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-pink-50/70 p-4 rounded-2xl border border-pink-200">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="font-display font-extrabold text-lg text-slate-900 mt-1">{value}</p>
    </div>
  );
}
