import { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { loadSessions } from '../engine/sessionStore';
import EmergencyContactModal from '../components/EmergencyContactModal';

export default function Dashboard() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [tab, setTab] = useState<string>('Triage history');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const TABS = [
    { key: 'Triage history', label: t('tabTriageHistory') },
    { key: 'Period history', label: t('tabPeriodHistory') },
    { key: 'Pregnancy tracking', label: t('tabPregnancyTracking') },
  ];

  const sessions = useMemo(() => loadSessions(user.id), [user.id, tab]);
  const periodLogs = useMemo(() => {
    const raw = localStorage.getItem(`ea_period_logs:${user.id}`);
    return raw ? JSON.parse(raw) : [];
  }, [user.id, tab]);
  const pregnancy = useMemo(() => {
    const raw = localStorage.getItem(`ea_pregnancy_profile:${user.id}`);
    return raw ? JSON.parse(raw) : null;
  }, [user.id, tab]);

  return (
    <div className="space-y-6 font-body animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-pink-200 shadow-xs">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900">{t('dashboard')}</h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">{t('dashboardSub')}</p>
        </div>

        {/* Mandatory Emergency Contact Card Banner */}
        <div className="flex items-center gap-3 p-3.5 bg-pink-50 rounded-2xl border border-pink-200 text-xs md:text-sm">
          <span className="text-xl">🚨</span>
          <div>
            <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">{t('emergencyContact')}</span>
            <span className="font-mono font-extrabold text-[#E85A91] text-xs md:text-sm">
              {user.emergencyContact?.phone ? `${user.emergencyContact.phone} (${user.emergencyContact.relationship})` : 'Not Set'}
            </span>
          </div>
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-[#E85A91] text-white font-bold text-xs shadow-2xs hover:bg-[#D4437B]"
          >
            {user.emergencyContact ? t('editContact') : t('addContact')}
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tItem) => (
          <button
            key={tItem.key}
            onClick={() => setTab(tItem.key)}
            className={`text-xs md:text-sm px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all duration-200 ${
              tab === tItem.key
                ? 'bg-[#E85A91] text-white shadow-md'
                : 'bg-white border border-pink-200 text-slate-900 hover:text-[#E85A91] hover:bg-pink-50'
            }`}
          >
            {tItem.label}
          </button>
        ))}
      </div>

      {/* Tab content panels */}
      {tab === 'Triage history' && (
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <div className="p-8 bg-white border border-pink-200 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 stagger-item">
              <div className="w-14 h-14 rounded-full bg-pink-100 border border-pink-300 flex items-center justify-center text-2xl text-[#E85A91]">
                📄
              </div>
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-base md:text-lg">{t('noTriageRecorded')}</h3>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[...sessions].reverse().map((s: any, i) => (
                <div
                  key={s.id}
                  className="p-5 bg-white border border-pink-200 rounded-2xl flex items-center justify-between hover:border-[#E85A91] transition-all stagger-item shadow-2xs"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div>
                    <p className={`font-extrabold text-base md:text-lg severity-${s.finalSeverity}`}>{s.finalSeverity}</p>
                    <p className="text-xs md:text-sm text-slate-600 font-bold mt-1">
                      {lang === 'bn' ? 'মডিউল:' : 'Module:'} <span className="capitalize text-slate-900 font-extrabold">{s.module}</span> · {new Date(s.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-pink-50 px-3 py-1.5 rounded-full border border-pink-200 text-[#E85A91]">
                    {s.aiPass ? (lang === 'bn' ? 'লোকাল + AI মূল্যায়ন' : 'Local + AI Review') : (lang === 'bn' ? 'লোকাল রুল ইঞ্জিন' : 'Local Rule Engine')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Period history' && (
        <div className="space-y-2">
          {periodLogs.length === 0 ? (
            <div className="p-8 bg-white border border-pink-200 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 stagger-item">
              <div className="w-14 h-14 rounded-full bg-pink-100 border border-pink-300 flex items-center justify-center text-2xl text-pink-600">
                🌸
              </div>
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-base md:text-lg">{t('noPeriodLogs')}</h3>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[...periodLogs].reverse().map((l: any, i) => (
                <div
                  key={l.id}
                  className="p-5 bg-white border border-pink-200 rounded-2xl text-xs md:text-sm font-bold flex justify-between items-center hover:border-[#E85A91] transition-all stagger-item shadow-2xs"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span className="font-extrabold text-slate-900">{l.cycleStartDate} <span className="font-normal text-slate-500">→</span> {l.cycleEndDate ?? (lang === 'bn' ? 'চলমান' : 'ongoing')}</span>
                  <span className="bg-pink-50 text-[#E85A91] text-xs md:text-sm px-3 py-1.5 rounded-full border border-pink-200 font-extrabold capitalize">{l.flowIntensity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Pregnancy tracking' && (
        <div className="space-y-2">
          {!pregnancy ? (
            <div className="p-8 bg-white border border-pink-200 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 stagger-item">
              <div className="w-14 h-14 rounded-full bg-pink-100 border border-pink-300 flex items-center justify-center text-2xl text-[#E85A91]">
                🤰
              </div>
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-base md:text-lg">{t('noPregnancySetup')}</h3>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white border border-pink-200 rounded-3xl text-xs md:text-sm text-slate-900 space-y-3 stagger-item shadow-xs font-medium">
              <div className="flex justify-between items-center border-b border-pink-100 pb-2">
                <span className="font-bold text-slate-600">{t('estimatedDueDate')}</span>
                <span className="font-extrabold text-[#E85A91] text-sm md:text-base">{pregnancy.dueDate}</span>
              </div>
              <div className="flex justify-between items-center border-b border-pink-100 pb-2">
                <span className="font-bold text-slate-600">{lang === 'bn' ? 'সম্পন্ন ANC চেকআপ' : 'ANC Visits Completed'}</span>
                <span className="bg-pink-50 text-[#E85A91] font-extrabold px-3 py-1 rounded-full border border-pink-200">
                  {pregnancy.ancVisits.filter((v: any) => v.completedAt).length} / {pregnancy.ancVisits.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-600">{lang === 'bn' ? 'সম্পন্ন টিটি টিকা' : 'TT Doses Completed'}</span>
                <span className="bg-pink-50 text-[#E85A91] font-extrabold px-3 py-1 rounded-full border border-pink-200">
                  {pregnancy.ttVaccinations.filter((v: any) => v.completedAt).length} / {pregnancy.ttVaccinations.length}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Emergency Contact Modal */}
      <EmergencyContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}
