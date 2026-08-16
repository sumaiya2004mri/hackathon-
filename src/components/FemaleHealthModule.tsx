import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarHeart, Loader2 } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { getCycleHistory, logCycleEntry, type CycleEntry } from "../lib/healthData";

interface Props {
  onBack: () => void;
}

const FLOW_OPTIONS: CycleEntry["flow"][] = ["light", "medium", "heavy"];
const COMMON_SYMPTOMS = ["Cramps", "Headache", "Fatigue", "Bloating", "Mood swings", "Acne"];

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Cycle length = days between consecutive period start dates.
 * Flags the most recent cycle if it deviates from the personal average
 * by more than 7 days — a common clinical rule-of-thumb threshold for
 * "irregular," without diagnosing a specific cause.
 */
function analyzeCycles(entries: CycleEntry[]) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  if (sorted.length < 2) return { avg: null, lengths: [], irregular: false, latestLength: null };

  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    lengths.push(daysBetween(sorted[i - 1].startDate, sorted[i].startDate));
  }
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const latestLength = lengths[lengths.length - 1];

  // Need at least 3 cycles before comparing the latest to a personal
  // baseline — two data points alone aren't a meaningful average.
  const irregular =
    sorted.length >= 4 && Math.abs(latestLength - avg) > 7;

  return { avg, lengths, irregular, latestLength };
}

function predictNextPeriod(entries: CycleEntry[], avg: number | null): string | null {
  if (!avg || entries.length === 0) return null;
  const sorted = [...entries].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const last = new Date(sorted[0].startDate);
  last.setDate(last.getDate() + Math.round(avg));
  return last.toISOString().slice(0, 10);
}

export function FemaleHealthModule({ onBack }: Props) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [periodLengthDays, setPeriodLengthDays] = useState(5);
  const [flow, setFlow] = useState<CycleEntry["flow"]>("medium");
  const [symptoms, setSymptoms] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    getCycleHistory(user.uid)
      .then(setEntries)
      .catch(() => setError("Couldn't load your cycle history."))
      .finally(() => setLoading(false));
  }, [user]);

  const { avg, irregular, latestLength } = useMemo(() => analyzeCycles(entries), [entries]);
  const nextPredicted = useMemo(() => predictNextPeriod(entries, avg), [entries, avg]);

  const overdue =
    nextPredicted !== null &&
    daysBetween(nextPredicted, new Date().toISOString().slice(0, 10)) > 5;

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleLogEntry = async () => {
    if (!user || !startDate) return;
    setSaving(true);
    setError(null);
    const entry: CycleEntry = { startDate, periodLengthDays, flow, symptoms };
    try {
      await logCycleEntry(user.uid, entry);
      setEntries((prev) => [entry, ...prev]);
      setStartDate("");
      setSymptoms([]);
    } catch {
      setError("Couldn't save this entry — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Start Date", "Period Length (days)", "Flow", "Symptoms"],
      ...entries.map((e) => [e.startDate, String(e.periodLengthDays), e.flow, e.symptoms.join("; ")]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cycle_history.csv";
    link.click();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mb-6 flex items-center gap-2">
        <CalendarHeart className="h-6 w-6 text-rose-500" />
        <h1 className="text-2xl font-bold text-blue-900">Cycle Tracker</h1>
      </div>

      {/* Summary */}
      {avg !== null && (
        <div className="card mb-6 p-6">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
            <div>
              <p className="text-2xl font-bold text-blue-900">{Math.round(avg)}</p>
              <p className="text-xs text-slate-500">Avg. cycle length (days)</p>
            </div>
            {latestLength !== null && (
              <div>
                <p className="text-2xl font-bold text-blue-900">{latestLength}</p>
                <p className="text-xs text-slate-500">Most recent cycle</p>
              </div>
            )}
            {nextPredicted && (
              <div>
                <p className="text-2xl font-bold text-blue-900">{nextPredicted}</p>
                <p className="text-xs text-slate-500">Predicted next period</p>
              </div>
            )}
          </div>

          {irregular && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Your most recent cycle differs from your personal average by
              more than a week. This alone isn't a diagnosis — occasional
              variation is normal — but if this keeps happening, it's worth
              mentioning to a doctor (possible causes range from stress to
              hormonal conditions like PCOS or thyroid changes).
            </div>
          )}

          {overdue && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              Your period looks more than 5 days overdue based on your
              average cycle. If there's a chance of pregnancy, consider
              taking a test — and if you're expecting, the Pregnancy
              Companion module can help from here.
            </div>
          )}
        </div>
      )}

      {/* Log new entry */}
      <div className="card mb-6 p-6">
        <h2 className="mb-4 text-lg font-bold text-blue-900">Log a Period</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">Period length (days)</label>
            <input
              type="number"
              value={periodLengthDays}
              onChange={(e) => setPeriodLengthDays(Number(e.target.value))}
              className="input-field"
              min={1}
              max={14}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="label-text">Flow intensity</label>
          <div className="flex gap-2">
            {FLOW_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFlow(f)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                  flow === f
                    ? "border-rose-400 bg-rose-50 text-rose-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="label-text">Symptoms</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptom(s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  symptoms.includes(s)
                    ? "border-rose-400 bg-rose-50 text-rose-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}

        <button
          onClick={handleLogEntry}
          disabled={saving || !startDate}
          className="btn-primary mt-5"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Entry
        </button>
      </div>

      {/* History + export */}
      <div className="card p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            History
          </h2>
          {entries.length > 0 && (
            <button onClick={exportCsv} className="btn-secondary text-xs">
              Export CSV
            </button>
          )}
        </div>
        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-slate-400">No entries logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((e, i) => (
              <li key={e.id ?? i} className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="font-semibold text-blue-900">{e.startDate}</span>
                <span className="text-slate-400">·</span>
                <span>{e.periodLengthDays}d</span>
                <span className="text-slate-400">·</span>
                <span className="capitalize">{e.flow}</span>
                {e.symptoms.length > 0 && (
                  <span className="text-slate-400">· {e.symptoms.join(", ")}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
