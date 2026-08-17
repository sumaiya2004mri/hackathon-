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
      <section className="card p-4">
        <h2 className="font-display font-semibold text-lg mb-3">Log a cycle</h2>
        <form onSubmit={addLog} className="grid grid-cols-2 gap-3">
          <label className="text-xs text-clinical-muted">Start date
            <input type="date" required value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })}
              className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-md p-2 text-sm" />
          </label>
          <label className="text-xs text-clinical-muted">End date (optional)
            <input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })}
              className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-md p-2 text-sm" />
          </label>
          <label className="text-xs text-clinical-muted">Flow
            <select value={form.flow} onChange={(e) => setForm({ ...form, flow: e.target.value as any })}
              className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-md p-2 text-sm">
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
            </select>
          </label>
          <label className="text-xs text-clinical-muted">Mood (optional)
            <input value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}
              className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-md p-2 text-sm" />
          </label>
          <label className="text-xs text-clinical-muted col-span-2">Symptoms (comma separated)
            <input value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
              placeholder="cramps, bloating, fatigue"
              className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-md p-2 text-sm" />
          </label>
          <button type="submit" className="col-span-2 px-4 py-2 rounded-md bg-clinical-accent text-clinical-bg font-medium text-sm">
            Save cycle log
          </button>
        </form>
      </section>

      {logs.length > 0 && (
        <section className="card p-4">
          <h2 className="font-display font-semibold text-lg mb-3">Your cycle, at a glance</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Stat label="Average cycle length" value={`${stats.averageCycleLengthDays} days`} />
            <Stat label="Average period length" value={`${stats.averagePeriodLengthDays} days`} />
            <Stat label="Predicted next period" value={stats.predictedNextStart} />
            <Stat label="Predicted fertile window" value={`${stats.predictedFertileWindow[0]} – ${stats.predictedFertileWindow[1]}`} />
          </div>

          {stats.irregularityNote && (
            <p className="mt-4 text-sm bg-severity-MONITOR/10 border border-severity-MONITOR/30 text-severity-MONITOR rounded-md p-3">
              {stats.irregularityNote}
            </p>
          )}

          {stats.isLate && (
            <div className="mt-4 text-sm bg-clinical-accent/10 border border-clinical-accent/30 rounded-md p-3">
              <p>Your period is {stats.daysLate} day{stats.daysLate === 1 ? '' : 's'} later than your usual pattern. This can happen for many reasons — stress, travel, illness — but if you've been sexually active, it may be worth considering a pregnancy test.</p>
              <button
                onClick={() => navigate('/pregnancy')}
                className="mt-2 text-xs px-3 py-1.5 rounded-md bg-clinical-accent/15 text-clinical-accent border border-clinical-accent/30"
              >
                Set up pregnancy tracking →
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => downloadBlob(exportPeriodCSV(logs), 'period-history.csv')}
              className="text-xs px-3 py-1.5 rounded-md bg-clinical-panel2 border border-clinical-border"
            >
              Export CSV
            </button>
            <button
              onClick={() => downloadBlob(exportPeriodReportPDF(logs, stats, user), 'period-summary.pdf')}
              className="text-xs px-3 py-1.5 rounded-md bg-clinical-panel2 border border-clinical-border"
            >
              Export doctor-shareable PDF
            </button>
          </div>
        </section>
      )}

      <section className="card p-4">
        <h2 className="font-display font-semibold text-lg mb-1">Is something wrong?</h2>
        <p className="text-xs text-clinical-muted mb-3">Symptom check runs through the same triage engine as the emergency module — anything urgent routes to hospital lookup automatically.</p>
        {!showSymptomCheck ? (
          <button onClick={() => setShowSymptomCheck(true)} className="text-sm px-4 py-2 rounded-md bg-clinical-panel2 border border-clinical-border">
            Check a period symptom
          </button>
        ) : (
          <TriageForm module="period" />
        )}
      </section>

      {logs.length > 0 && (
        <section className="card p-4">
          <h2 className="font-display font-semibold text-lg mb-3">History</h2>
          <ul className="space-y-1 text-sm text-clinical-muted">
            {[...logs].reverse().map((l) => (
              <li key={l.id}>{l.cycleStartDate} → {l.cycleEndDate ?? 'ongoing'} · {l.flowIntensity}{l.symptoms.length ? ` · ${l.symptoms.join(', ')}` : ''}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-clinical-muted">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
