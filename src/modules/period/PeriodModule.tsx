import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PeriodLog } from '../../types';
import { useAuth } from '../../auth/AuthContext';
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

export default function PeriodModule() {
  const { user } = useAuth();
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

  return (
    <div className="space-y-6">
      {/* Log a cycle form */}
      <section className="card p-5 animate-fade-in">
        <h2 className="font-display font-semibold text-xl mb-3 text-clinical-text">Log a cycle</h2>
        <form onSubmit={addLog} className="grid grid-cols-2 gap-4">
          <label className="text-xs font-semibold text-clinical-muted uppercase tracking-wider block">
            Start date
            <input 
              type="date" 
              required 
              value={form.start} 
              onChange={(e) => setForm({ ...form, start: e.target.value })}
              className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-lg p-2.5 text-sm text-clinical-text focus:outline-none focus:ring-2 focus:ring-period-accent transition-all duration-200" 
            />
          </label>
          
          <label className="text-xs font-semibold text-clinical-muted uppercase tracking-wider block">
            End date (optional)
            <input 
              type="date" 
              value={form.end} 
              onChange={(e) => setForm({ ...form, end: e.target.value })}
              className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-lg p-2.5 text-sm text-clinical-text focus:outline-none focus:ring-2 focus:ring-period-accent transition-all duration-200" 
            />
          </label>
          
          <label className="text-xs font-semibold text-clinical-muted uppercase tracking-wider block">
            Flow
            <select 
              value={form.flow} 
              onChange={(e) => setForm({ ...form, flow: e.target.value as any })}
              className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-lg p-2.5 text-sm text-clinical-text focus:outline-none focus:ring-2 focus:ring-period-accent transition-all duration-200"
            >
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
            </select>
          </label>
          
          <label className="text-xs font-semibold text-clinical-muted uppercase tracking-wider block">
            Mood (optional)
            <input 
              value={form.mood} 
              onChange={(e) => setForm({ ...form, mood: e.target.value })}
              placeholder="e.g. happy, tired, moody"
              className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-lg p-2.5 text-sm text-clinical-text focus:outline-none focus:ring-2 focus:ring-period-accent transition-all duration-200" 
            />
          </label>
          
          <label className="text-xs font-semibold text-clinical-muted uppercase tracking-wider block col-span-2">
            Symptoms (comma separated)
            <input 
              value={form.symptoms} 
              onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
              placeholder="e.g. cramps, bloating, fatigue"
              className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-lg p-2.5 text-sm text-clinical-text focus:outline-none focus:ring-2 focus:ring-period-accent transition-all duration-200" 
            />
          </label>
          
          <button 
            type="submit" 
            className="col-span-2 px-4 py-2.5 mt-2 rounded-lg bg-period-accent text-white font-semibold text-sm transition-all hover:bg-period-accent/90 focus:outline-none focus:ring-2 focus:ring-period-accent/50 active:scale-[0.99]"
          >
            Save cycle log
          </button>
        </form>
      </section>

      {/* Cycle stats card */}
      {logs.length > 0 && (
        <section className="card p-5 animate-fade-in">
          <h2 className="font-display font-semibold text-xl mb-4 text-clinical-text">Your cycle, at a glance</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Stat label="Average cycle length" value={`${stats.averageCycleLengthDays} days`} />
            <Stat label="Average period length" value={`${stats.averagePeriodLengthDays} days`} />
            <Stat label="Predicted next period" value={stats.predictedNextStart} />
            <Stat label="Predicted fertile window" value={`${stats.predictedFertileWindow[0]} – ${stats.predictedFertileWindow[1]}`} />
          </div>

          {stats.irregularityNote && (
            <p className="mt-4 text-sm bg-severity-monitor/10 border border-severity-monitor/30 text-severity-monitor rounded-lg p-3.5 stagger-item">
              {stats.irregularityNote}
            </p>
          )}

          {stats.isLate && (
            <div className="mt-4 text-sm bg-period-bg border border-period-border text-clinical-text rounded-lg p-4 stagger-item">
              <p>Your period is {stats.daysLate} day{stats.daysLate === 1 ? '' : 's'} later than your usual pattern. This can happen for many reasons — stress, travel, illness — but if you've been sexually active, it may be worth considering a pregnancy test.</p>
              <button
                onClick={() => navigate('/pregnancy')}
                className="mt-3 text-xs font-semibold px-3.5 py-2 rounded-lg bg-period-accent text-white border border-period-accent transition-all hover:bg-period-accent/90"
              >
                Set up pregnancy tracking →
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2.5 mt-5 border-t border-clinical-border/50 pt-4">
            <button
              onClick={() => downloadBlob(exportPeriodCSV(logs), 'period-history.csv')}
              className="text-xs px-3.5 py-2 rounded-lg bg-clinical-panel2 border border-clinical-border font-medium text-clinical-text hover:bg-clinical-panel hover:border-clinical-muted transition-all"
            >
              Export CSV
            </button>
            <button
              onClick={() => downloadBlob(exportPeriodReportPDF(logs, stats, user), 'period-summary.pdf')}
              className="text-xs px-3.5 py-2 rounded-lg bg-clinical-panel2 border border-clinical-border font-medium text-clinical-text hover:bg-clinical-panel hover:border-clinical-muted transition-all"
            >
              Export doctor-shareable PDF
            </button>
          </div>
        </section>
      )}

      {/* Symptom Checker entry point */}
      <section className="card p-4 animate-fade-in">
        <h2 className="font-display font-semibold text-lg mb-1 text-clinical-text">Is something wrong?</h2>
        <p className="text-xs text-clinical-muted mb-3">Symptom check runs through the same triage engine as the emergency module — anything urgent routes to hospital lookup automatically.</p>
        {!showSymptomCheck ? (
          <button 
            onClick={() => setShowSymptomCheck(true)} 
            className="text-sm font-medium px-4 py-2.5 rounded-lg bg-clinical-panel2 border border-clinical-border text-clinical-text hover:bg-clinical-panel hover:border-clinical-muted transition-all"
          >
            Check a period symptom
          </button>
        ) : (
          <TriageForm module="period" />
        )}
      </section>

      {/* History section */}
      <section className="card p-5 animate-fade-in">
        <h2 className="font-display font-semibold text-xl mb-4 text-clinical-text">History</h2>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-period-bg border border-period-border flex items-center justify-center text-period-accent">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-semibold text-clinical-text text-base">No period logs yet</h3>
              <p className="text-xs text-clinical-muted mt-1 max-w-xs mx-auto">
                Start logging your cycles above to see predictions, fertile windows, and detailed history analysis.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2.5 text-sm text-clinical-muted">
            {[...logs].reverse().map((l, i) => (
              <li 
                key={l.id} 
                className="stagger-item flex items-center justify-between border-b border-clinical-border/50 pb-2.5 last:border-0 last:pb-0"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div>
                  <span className="font-semibold text-clinical-text">{l.cycleStartDate}</span>
                  <span className="mx-2 text-clinical-muted">→</span>
                  <span className={l.cycleEndDate ? 'font-semibold text-clinical-text' : 'italic text-period-accent font-medium'}>
                    {l.cycleEndDate ?? 'ongoing'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-period-bg text-period-accent text-xs px-2.5 py-1 rounded-md border border-period-border font-semibold capitalize">
                    {l.flowIntensity}
                  </span>
                  {l.symptoms.length > 0 && (
                    <span className="bg-clinical-panel2 text-clinical-muted text-xs px-2.5 py-1 rounded-md border border-clinical-border">
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
    <div className="bg-clinical-panel2 p-3.5 rounded-lg border border-clinical-border/30">
      <p className="text-xs text-clinical-muted font-medium uppercase tracking-wider">{label}</p>
      <p className="font-display font-semibold text-lg text-clinical-text mt-1">{value}</p>
    </div>
  );
}
