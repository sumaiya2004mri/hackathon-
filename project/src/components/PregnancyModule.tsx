import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Baby,
  Loader2,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import {
  getPregnancySymptomHistory,
  logPregnancySymptomCheck,
  savePregnancyProfile,
  type PregnancySymptomCheck,
} from "../lib/healthData";

interface Props {
  onBack: () => void;
}

// Week-by-week size comparisons (weeks 4–40), gestational age from LMP.
const SIZE_BY_WEEK: Record<number, string> = {
  4: "a poppy seed", 5: "a sesame seed", 6: "a lentil", 7: "a blueberry",
  8: "a kidney bean", 9: "a grape", 10: "a kumquat", 11: "a fig",
  12: "a lime", 13: "a lemon", 14: "a peach", 15: "an apple",
  16: "an avocado", 17: "a turnip", 18: "a bell pepper", 19: "a mango",
  20: "a banana", 21: "a carrot", 22: "a papaya", 23: "a grapefruit",
  24: "an ear of corn", 25: "a cauliflower head", 26: "a lettuce head",
  27: "a rutabaga", 28: "an eggplant", 29: "a butternut squash",
  30: "a cabbage", 31: "a coconut", 32: "a jicama", 33: "a pineapple",
  34: "a cantaloupe", 35: "a honeydew melon", 36: "a papaya (large)",
  37: "a bunch of leeks", 38: "a leek bundle", 39: "a mini watermelon",
  40: "a small pumpkin",
};

const MILESTONES: { week: number; label: string }[] = [
  { week: 6, label: "Heartbeat often first detectable" },
  { week: 12, label: "End of first trimester" },
  { week: 18, label: "Movement may become noticeable" },
  { week: 24, label: "Viability milestone (with intensive care)" },
  { week: 27, label: "End of second trimester" },
  { week: 37, label: "Considered full term soon" },
];

// Danger signs — bypass classification and route straight to emergency.
const EMERGENCY_KEYWORDS = [
  "heavy bleeding", "severe headache", "blurred vision", "blurry vision",
  "reduced movement", "no movement", "baby not moving", "severe abdominal pain",
  "can't breathe", "difficulty breathing", "seizure", "fainting",
];

const MONITOR_KEYWORDS = [
  "nausea", "morning sickness", "back pain", "mild swelling", "swelling",
  "heartburn", "tired", "fatigue", "constipation", "cramping",
];

const SEE_DOCTOR_KEYWORDS = [
  "spotting", "light bleeding", "fever", "painful urination",
  "persistent vomiting", "severe swelling", "dizzy",
];

function classifySymptom(text: string): PregnancySymptomCheck["classification"] {
  const lower = text.toLowerCase();
  if (EMERGENCY_KEYWORDS.some((k) => lower.includes(k))) return "Emergency";
  if (SEE_DOCTOR_KEYWORDS.some((k) => lower.includes(k))) return "See Doctor";
  if (MONITOR_KEYWORDS.some((k) => lower.includes(k))) return "Monitor";
  return "Normal";
}

const CLASSIFICATION_STYLES: Record<
  PregnancySymptomCheck["classification"],
  { border: string; bg: string; text: string; label: string }
> = {
  Normal: { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", label: "✅ Normal — commonly experienced" },
  Monitor: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", label: "👀 Monitor — keep an eye on it" },
  "See Doctor": { border: "border-orange-300", bg: "bg-orange-50", text: "text-orange-700", label: "🩺 See a doctor soon" },
  Emergency: { border: "border-rose-400", bg: "bg-rose-50", text: "text-rose-700", label: "🚨 Emergency — seek care now" },
};

function gestationalWeek(lmpDate: string): number | null {
  if (!lmpDate) return null;
  const lmp = new Date(lmpDate);
  if (Number.isNaN(lmp.getTime())) return null;
  const diffDays = Math.floor((Date.now() - lmp.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7);
  return week >= 0 && week <= 42 ? week : null;
}

export function PregnancyModule({ onBack }: Props) {
  const { user } = useAuth();
  const [lmpDate, setLmpDate] = useState("");
  const [symptomText, setSymptomText] = useState("");
  const [checking, setChecking] = useState(false);
  const [lastResult, setLastResult] = useState<PregnancySymptomCheck | null>(null);
  const [history, setHistory] = useState<PregnancySymptomCheck[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  const week = useMemo(() => gestationalWeek(lmpDate), [lmpDate]);

  useEffect(() => {
    if (!user) return;
    getPregnancySymptomHistory(user.uid)
      .then(setHistory)
      .catch(() => setSaveError("Couldn't load your symptom history."))
      .finally(() => setLoadingHistory(false));
  }, [user]);

  const handleSaveLmp = async () => {
    if (!user || !lmpDate) return;
    try {
      await savePregnancyProfile(user.uid, { lmpDate });
    } catch {
      setSaveError("Couldn't save your due-date info — check your connection.");
    }
  };

  const handleCheckSymptom = async () => {
    if (!user || !symptomText.trim()) return;
    setChecking(true);
    setSaveError(null);
    const classification = classifySymptom(symptomText);
    const entry: PregnancySymptomCheck = { text: symptomText.trim(), classification };
    try {
      await logPregnancySymptomCheck(user.uid, entry);
      setLastResult(entry);
      setHistory((prev) => [entry, ...prev]);
      setSymptomText("");
    } catch {
      setSaveError("Couldn't save this check — it wasn't recorded, but here's the result:");
      setLastResult(entry);
    } finally {
      setChecking(false);
    }
  };

  const resultStyle = lastResult ? CLASSIFICATION_STYLES[lastResult.classification] : null;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-amber-500" />
        <p className="text-sm text-slate-600">
          Sign in to use the Pregnancy Companion — your entries are saved to
          your account.
        </p>
      </div>
    );
  }

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
        <Baby className="h-6 w-6 text-rose-500" />
        <h1 className="text-2xl font-bold text-blue-900">Pregnancy Companion</h1>
      </div>

      {/* Fetal size tracker */}
      <div className="card mb-6 p-6">
        <label className="label-text">First day of your last period</label>
        <div className="flex gap-2">
          <input
            type="date"
            value={lmpDate}
            onChange={(e) => setLmpDate(e.target.value)}
            className="input-field"
          />
          <button onClick={handleSaveLmp} className="btn-secondary flex-shrink-0">
            Save
          </button>
        </div>

        {week !== null && (
          <div className="mt-5 rounded-2xl bg-rose-50 p-5 text-center">
            <p className="text-sm font-semibold text-rose-500">Week {week}</p>
            <p className="mt-1 text-lg font-bold text-blue-900">
              About the size of {SIZE_BY_WEEK[week] ?? "a growing baby"}
            </p>
            {MILESTONES.filter((m) => m.week === week).map((m) => (
              <p key={m.week} className="mt-2 text-sm font-medium text-rose-600">
                🎉 Milestone this week: {m.label}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Symptom classifier */}
      <div className="card mb-6 p-6">
        <h2 className="mb-1 text-lg font-bold text-blue-900">Is this normal?</h2>
        <p className="mb-4 text-sm text-slate-500">
          Describe a symptom. Non-diagnostic guidance only — always trust your
          own judgment and your care provider.
        </p>
        <textarea
          value={symptomText}
          onChange={(e) => setSymptomText(e.target.value)}
          placeholder="e.g. mild back pain and some swelling in my feet"
          rows={3}
          className="input-field resize-none"
        />
        <button
          onClick={handleCheckSymptom}
          disabled={checking || !symptomText.trim()}
          className="btn-primary mt-3"
        >
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Check Symptom
        </button>

        {saveError && (
          <p className="mt-3 text-xs font-medium text-amber-600">{saveError}</p>
        )}

        {lastResult && resultStyle && (
          <div className={`mt-4 rounded-xl border p-4 ${resultStyle.border} ${resultStyle.bg}`}>
            <p className={`font-bold ${resultStyle.text}`}>{resultStyle.label}</p>
            <p className="mt-1 text-sm text-slate-600">"{lastResult.text}"</p>
            {lastResult.classification === "Emergency" && (
              <a
                href="tel:999"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-rose-500"
              >
                <PhoneCall className="h-4 w-4" />
                Call 999 now
              </a>
            )}
          </div>
        )}
      </div>

      {/* History */}
      <div className="card p-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Symptom History
        </h2>
        {loadingHistory ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-slate-400">No symptom checks logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h, i) => (
              <li key={h.id ?? i} className="flex items-start gap-2 text-sm">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-300" />
                <span className="text-slate-600">
                  <strong>{h.classification}:</strong> {h.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
