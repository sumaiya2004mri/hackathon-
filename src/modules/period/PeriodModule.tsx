import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PeriodLog } from '../../types';
import { useAuth } from '../../auth/AuthContext';
import { computeCycleStats } from './cycleStats';
import { exportPeriodCSV, exportPeriodReportPDF, downloadBlob } from '../../export/exportEngine';
import TriageForm from '../../components/TriageForm';
import { readCollection, appendToCollection } from '../../services/dataStore';

export default function PeriodModule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<PeriodLog[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showSymptomCheck, setShowSymptomCheck] = useState(false);

  const [form, setForm] = useState({ start: '', end: '', flow: 'medium' as PeriodLog['flowIntensity'], symptoms: '', mood: '' });
  const [justSaved, setJustSaved] = useState(false); // brief confirm-pulse on log, per micro-interaction spec

  useEffect(() => {
    readCollection<PeriodLog>(user.id, user.isGuest, 'periodLogs').then((l) => {
      setLogs(l);
      setLoaded(true);
    });
  }, [user.id, user.isGuest]);

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
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 900);
  }

  return (
    <div className="space-y-6">
      <section className="card card-period p-4">
        <h2 className="font-display font-semibold text-lg mb-3 text-ink">Log a cycle</h2>
        <form onSubmit={addLog} className="grid grid-cols-2 gap-3">
          <label className="text-xs text-ink-muted">Start date
            <input type="date" required value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })}
              className="w-full mt-1 bg-white border border-cream-border rounded-md p-2 text-sm text-ink" />
          </label>
          <label className="text-xs text-ink-muted">End date (optional)
            <input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })}
              className="w-full mt-1 bg-white border border-cream-border rounded-md p-2 text-sm text-ink" />
          </label>
          <label className="text-xs text-ink-muted">Flow
            <select value={form.flow} onChange={(e) => setForm({ ...form, flow: e.target.value as any })}
              className="w-full mt-1 bg-white border border-cream-border rounded-md p-2 text-sm text-ink">
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
            </select>
          </label>
          <label className="text-xs text-ink-muted">Mood (optional)
            <input value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}
              className="w-full mt-1 bg-white border border-cream-border rounded-md p-2 text-sm text-ink" />
          </label>
          <label className="text-xs text-ink-muted col-span-2">Symptoms (comma separated)
            <input value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
              placeholder="cramps, bloating, fatigue"
              className="w-full mt-1 bg-white border border-cream-border rounded-md p-2 text-sm text-ink" />
          </label>
          <button type="submit" className="press col-span-2 px-4 py-2 rounded-full bg-module-period text-white font-medium text-sm">
            {justSaved ? '✓ Saved' : 'Save cycle log'}
          </button>
        </form>
      </section>

      {logs.length > 0 && (
        <section className="card card-period p-4">
          <h2 className="font-display font-semibold text-lg mb-3 text-ink">Your cycle, at a glance</h2>
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
            <div className="mt-4 text-sm bg-module-emergencyBg border border-module-emergency/25 rounded-md p-3">
              <p className="text-ink">Your period is {stats.daysLate} day{stats.daysLate === 1 ? '' : 's'} later than your usual pattern. This can happen for many reasons — stress, travel, illness — but if you've been sexually active, it may be worth considering a pregnancy test.</p>
              <button
                onClick={() => navigate('/pregnancy')}
                className="press mt-2 text-xs px-3 py-1.5 rounded-full bg-module-pregnancyBg text-module-pregnancy"
              >
                Set up pregnancy tracking →
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => downloadBlob(exportPeriodCSV(logs), 'period-history.csv')}
              className="press text-xs px-3 py-1.5 rounded-full bg-white border border-cream-border text-ink"
            >
              Export CSV
            </button>
            <button
              onClick={() => downloadBlob(exportPeriodReportPDF(logs, stats, user), 'period-summary.pdf')}
              className="press text-xs px-3 py-1.5 rounded-full bg-white border border-cream-border text-ink"
            >
              Export doctor-shareable PDF
            </button>
          </div>
        </section>
      )}

      <section className="card card-neutral p-4">
        <h2 className="font-display font-semibold text-lg mb-1 text-ink">Is something wrong?</h2>
        <p className="text-xs text-ink-muted mb-3">Symptom check runs through the same triage engine as the emergency module — anything urgent routes to hospital lookup automatically.</p>
        {!showSymptomCheck ? (
          <button onClick={() => setShowSymptomCheck(true)} className="press text-sm px-4 py-2 rounded-full bg-white border border-cream-border text-ink">
            Check a period symptom
          </button>
        ) : (
          <TriageForm module="period" />
        )}
      </section>

      {logs.length > 0 && (
        <section className="card card-period p-4">
          <h2 className="font-display font-semibold text-lg mb-3 text-ink">History</h2>
          <ul className="space-y-1 text-sm text-ink-muted">
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
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="font-medium text-ink">{value}</p>
    </div>
  );
}
