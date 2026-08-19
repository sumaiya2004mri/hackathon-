import { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { loadSessions } from '../engine/sessionStore';

const TABS = ['Triage history', 'Period history', 'Pregnancy tracking'] as const;

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Triage history');
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
    <div className="space-y-5 animate-fade-in">
      <h1 className="font-display text-3xl font-semibold text-clinical-text">Dashboard</h1>
      
      {/* Navigation tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button 
            key={t} 
            onClick={() => setTab(t)}
            className={`text-sm px-3.5 py-2 rounded-lg font-medium whitespace-nowrap border transition-all duration-200 ${
              tab === t 
                ? 'bg-clinical-accent/10 text-clinical-text border-clinical-accent/20' 
                : 'bg-clinical-panel border-clinical-border text-clinical-muted hover:text-clinical-text hover:border-clinical-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content panels */}
      {tab === 'Triage history' && (
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <div className="card p-6 flex flex-col items-center justify-center text-center space-y-3 py-10 stagger-item">
              <div className="w-12 h-12 rounded-full bg-clinical-panel2 border border-clinical-border flex items-center justify-center text-clinical-muted">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-semibold text-clinical-text text-base">No triage sessions yet</h3>
                <p className="text-xs text-clinical-muted mt-1 max-w-xs mx-auto">When you use the Symptom Checker flow, your triage results SBAR summaries will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {[...sessions].reverse().map((s: any, i) => (
                <div 
                  key={s.id} 
                  className="card p-4 flex items-center justify-between hover:bg-clinical-panel2/50 transition-all stagger-item card-interactive"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div>
                    <p className={`font-semibold severity-${s.finalSeverity}`}>{s.finalSeverity}</p>
                    <p className="text-xs text-clinical-muted mt-1">Module: <span className="capitalize font-medium text-clinical-text">{s.module}</span> · {new Date(s.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="text-xs bg-clinical-panel2 px-2 py-1 rounded border border-clinical-border font-medium text-clinical-muted">
                    {s.aiPass ? 'local + AI' : 'local only'}
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
            <div className="card p-6 flex flex-col items-center justify-center text-center space-y-3 py-10 stagger-item">
              <div className="w-12 h-12 rounded-full bg-period-bg border border-period-border flex items-center justify-center text-period-accent">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-semibold text-clinical-text text-base">No period logs yet</h3>
                <p className="text-xs text-clinical-muted mt-1 max-w-xs mx-auto">Set up logging in the Period module to track cycle averages, predict next start, and log symptoms.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {[...periodLogs].reverse().map((l: any, i) => (
                <div 
                  key={l.id} 
                  className="card p-4 text-sm flex justify-between items-center hover:bg-clinical-panel2/50 transition-all stagger-item card-interactive"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span className="font-semibold text-clinical-text">{l.cycleStartDate} <span className="font-normal text-clinical-muted">→</span> {l.cycleEndDate ?? 'ongoing'}</span>
                  <span className="bg-period-bg text-period-accent text-xs px-2.5 py-1 rounded-md border border-period-border font-semibold capitalize">{l.flowIntensity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Pregnancy tracking' && (
        <div className="space-y-2">
          {!pregnancy ? (
            <div className="card p-6 flex flex-col items-center justify-center text-center space-y-3 py-10 stagger-item">
              <div className="w-12 h-12 rounded-full bg-pregnancy-bg border border-pregnancy-border flex items-center justify-center text-pregnancy-accent">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-semibold text-clinical-text text-base">Pregnancy tracking not set up</h3>
                <p className="text-xs text-clinical-muted mt-1 max-w-xs mx-auto">Set up your Last Menstrual Period in the Pregnancy module to compute due dates and track baby development details.</p>
              </div>
            </div>
          ) : (
            <div className="card p-5 text-sm text-clinical-text space-y-3 stagger-item">
              <div className="flex justify-between items-center border-b border-clinical-border/50 pb-2">
                <span className="font-medium text-clinical-muted">Due date</span>
                <span className="font-semibold">{pregnancy.dueDate}</span>
              </div>
              <div className="flex justify-between items-center border-b border-clinical-border/50 pb-2">
                <span className="font-medium text-clinical-muted">ANC visits completed</span>
                <span className="bg-pregnancy-bg text-pregnancy-accent font-semibold px-2 py-0.5 rounded border border-pregnancy-border">
                  {pregnancy.ancVisits.filter((v: any) => v.completedAt).length} / {pregnancy.ancVisits.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-clinical-muted">TT doses completed</span>
                <span className="bg-pregnancy-bg text-pregnancy-accent font-semibold px-2 py-0.5 rounded border border-pregnancy-border">
                  {pregnancy.ttVaccinations.filter((v: any) => v.completedAt).length} / {pregnancy.ttVaccinations.length}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
