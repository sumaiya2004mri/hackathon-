import { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { loadSessions } from '../engine/sessionStore';
import EmergencyContactModal from '../components/EmergencyContactModal';

const TABS = ['Triage history', 'Period history', 'Pregnancy tracking'] as const;

export default function Dashboard() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Triage history');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-pink-200 shadow-xs">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">{t('dashboard')}</h1>
          <p className="text-xs text-slate-600 font-medium">Personalized maternal history, vitals, and emergency contact details.</p>
        </div>

        {/* Mandatory Emergency Contact Card Banner */}
        <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-2xl border border-pink-200 text-xs">
          <span className="text-lg">🚨</span>
          <div>
            <span className="text-slate-500 font-bold block text-[10px]">{t('emergencyContact')}</span>
            <span className="font-mono font-extrabold text-[#E85A91]">
              {user.emergencyContact?.phone ? `${user.emergencyContact.phone} (${user.emergencyContact.relationship})` : 'Not Set'}
            </span>
          </div>
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="px-3 py-1.5 rounded-full bg-[#E85A91] text-white font-bold text-[11px] shadow-2xs hover:bg-[#D4437B]"
          >
            {user.emergencyContact ? 'Edit' : 'Add'}
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tItem) => (
          <button
            key={tItem}
            onClick={() => setTab(tItem)}
            className={`text-xs px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all duration-200 ${
              tab === tItem
                ? 'bg-[#E85A91] text-white shadow-md'
                : 'bg-white border border-pink-200 text-slate-900 hover:text-[#E85A91] hover:bg-pink-50'
            }`}
          >
            {tItem}
          </button>
        ))}
      </div>

      {/* Tab content panels */}
      {tab === 'Triage history' && (
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <div className="p-8 bg-white border border-pink-200 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 stagger-item">
              <div className="w-12 h-12 rounded-full bg-pink-100 border border-pink-300 flex items-center justify-center text-xl text-[#E85A91]">
                📄
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base">No triage sessions recorded</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto font-medium">When you perform a symptom check, your triage results & SBAR medical summaries will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {[...sessions].reverse().map((s: any, i) => (
                <div
                  key={s.id}
                  className="p-4 bg-white border border-pink-200 rounded-2xl flex items-center justify-between hover:border-[#E85A91] transition-all stagger-item shadow-2xs"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div>
                    <p className={`font-bold severity-${s.finalSeverity}`}>{s.finalSeverity}</p>
                    <p className="text-xs text-slate-600 font-medium mt-1">Module: <span className="capitalize font-bold text-slate-900">{s.module}</span> · {new Date(s.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="text-xs bg-pink-50 px-3 py-1 rounded-full border border-pink-200 font-bold text-[#E85A91]">
                    {s.aiPass ? 'Local + AI Review' : 'Local Rule Engine'}
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
              <div className="w-12 h-12 rounded-full bg-pink-100 border border-pink-300 flex items-center justify-center text-xl text-pink-600">
                🌸
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base">No period logs recorded yet</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto font-medium">Log your period in the Period module to track cycle lengths and predict fertile windows.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {[...periodLogs].reverse().map((l: any, i) => (
                <div
                  key={l.id}
                  className="p-4 bg-white border border-pink-200 rounded-2xl text-xs font-bold flex justify-between items-center hover:border-[#E85A91] transition-all stagger-item shadow-2xs"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span className="font-extrabold text-slate-900">{l.cycleStartDate} <span className="font-normal text-slate-500">→</span> {l.cycleEndDate ?? 'ongoing'}</span>
                  <span className="bg-pink-50 text-[#E85A91] text-xs px-3 py-1 rounded-full border border-pink-200 font-bold capitalize">{l.flowIntensity} Flow</span>
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
              <div className="w-12 h-12 rounded-full bg-pink-100 border border-pink-300 flex items-center justify-center text-xl text-[#E85A91]">
                🤰
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base">Pregnancy tracking not configured</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto font-medium">Set up your Last Menstrual Period in the Pregnancy module to compute due dates and track baby development details.</p>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white border border-pink-200 rounded-3xl text-xs text-slate-900 space-y-3 stagger-item shadow-xs font-medium">
              <div className="flex justify-between items-center border-b border-pink-100 pb-2">
                <span className="font-semibold text-slate-600">Estimated Due Date</span>
                <span className="font-extrabold text-[#E85A91]">{pregnancy.dueDate}</span>
              </div>
              <div className="flex justify-between items-center border-b border-pink-100 pb-2">
                <span className="font-semibold text-slate-600">ANC Visits Completed</span>
                <span className="bg-pink-50 text-[#E85A91] font-bold px-3 py-1 rounded-full border border-pink-200">
                  {pregnancy.ancVisits.filter((v: any) => v.completedAt).length} / {pregnancy.ancVisits.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-600">TT Doses Completed</span>
                <span className="bg-pink-50 text-[#E85A91] font-bold px-3 py-1 rounded-full border border-pink-200">
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
