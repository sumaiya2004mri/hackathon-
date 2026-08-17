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
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-sm px-3 py-1.5 rounded-md whitespace-nowrap border ${tab === t ? 'bg-clinical-accent/15 text-clinical-accent border-clinical-accent/30' : 'bg-clinical-panel2 border-clinical-border text-clinical-muted'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Triage history' && (
        <div className="space-y-2">
          {sessions.length === 0 && <p className="text-sm text-clinical-muted">No triage sessions yet.</p>}
          {[...sessions].reverse().map((s: any) => (
            <div key={s.id} className="card p-3 flex items-center justify-between">
              <div>
                <p className={`font-medium severity-${s.finalSeverity}`}>{s.finalSeverity}</p>
                <p className="text-xs text-clinical-muted">{s.module} · {new Date(s.createdAt).toLocaleString()}</p>
              </div>
              <span className="text-xs text-clinical-muted">{s.aiPass ? 'local + AI' : 'local only'}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'Period history' && (
        <div className="space-y-2">
          {periodLogs.length === 0 && <p className="text-sm text-clinical-muted">No period logs yet.</p>}
          {[...periodLogs].reverse().map((l: any) => (
            <div key={l.id} className="card p-3 text-sm">
              {l.cycleStartDate} → {l.cycleEndDate ?? 'ongoing'} · {l.flowIntensity}
            </div>
          ))}
        </div>
      )}

      {tab === 'Pregnancy tracking' && (
        <div>
          {!pregnancy && <p className="text-sm text-clinical-muted">Pregnancy tracking not set up yet.</p>}
          {pregnancy && (
            <div className="card p-4 text-sm">
              <p>Due date: {pregnancy.dueDate}</p>
              <p>ANC visits completed: {pregnancy.ancVisits.filter((v: any) => v.completedAt).length} / {pregnancy.ancVisits.length}</p>
              <p>TT doses completed: {pregnancy.ttVaccinations.filter((v: any) => v.completedAt).length} / {pregnancy.ttVaccinations.length}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
