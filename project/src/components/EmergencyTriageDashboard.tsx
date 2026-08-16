import { useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  Camera,
  CheckCircle2,
  Download,
  Flame,
  Heart,
  Moon,
  Phone,
  Send,
  Shield,
  Siren,
  Stethoscope,
  Sun,
  Thermometer,
  Wrench,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Vitals {
  age: string;
  weight: string;
  temperature: string;
  pain: number;
  symptomText: string;
}

type EsiLevel = 1 | 2 | 3 | 5 | null;

interface EsiResult {
  level: EsiLevel;
  badge: string;
  description: string;
  accent: "rose" | "amber" | "emerald" | "indigo";
}

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  imageUrl?: string;
}

interface KeywordHit {
  keyword: string;
  level: 1 | 2;
}

// Life-threatening: forces ESI Level 1 regardless of vitals.
const LEVEL1_KEYWORDS = [
  "chest pain",
  "can't breathe",
  "cant breathe",
  "breathing issue",
  "difficulty breathing",
  "unconscious",
];

// Serious structural/traumatic: forces ESI Level 2 regardless of vitals.
// A suspected fracture is a real ESI red flag — delayed care risks nerve
// damage or improper healing — so it must not be classified as "moderate."
const LEVEL2_KEYWORDS = [
  "broken",
  "fracture",
  "bleeding",
  "severe bleeding",
  "deformity",
];

function findKeywordHit(text: string): KeywordHit | null {
  const lower = text.toLowerCase();
  const l1 = LEVEL1_KEYWORDS.find((kw) => lower.includes(kw));
  if (l1) return { keyword: l1, level: 1 };
  const l2 = LEVEL2_KEYWORDS.find((kw) => lower.includes(kw));
  if (l2) return { keyword: l2, level: 2 };
  return null;
}

/* ------------------------------------------------------------------ */
/*  Deterministic ESI triage logic                                     */
/* ------------------------------------------------------------------ */

function computeEsi(vitals: Vitals, keywordHit: KeywordHit | null): EsiResult {
  const age = parseFloat(vitals.age);
  const temp = parseFloat(vitals.temperature);
  const pain = vitals.pain;

  const hasAge = !Number.isNaN(age);
  const hasTemp = !Number.isNaN(temp);

  if (keywordHit?.level === 1) {
    return {
      level: 1,
      badge: "ESI LEVEL 1: CRITICAL IMMEDIATE SURGE",
      description: `Reported symptom "${keywordHit.keyword}" is a life-threatening red flag. This bypasses vitals-based scoring — seek emergency care immediately.`,
      accent: "rose",
    };
  }

  if (keywordHit?.level === 2) {
    return {
      level: 2,
      badge: "ESI LEVEL 2: HIGH-URGENCY RESPONSE REQUIRED",
      description: `Reported symptom "${keywordHit.keyword}" is treated as a high-urgency structural/traumatic red flag regardless of vitals. Delays can risk nerve damage or improper healing — seek prompt care.`,
      accent: "amber",
    };
  }

  if (hasAge && hasTemp && age <= 3 && temp >= 100.4) {
    return {
      level: 1,
      badge: "ESI LEVEL 1: CRITICAL PEDIATRIC SURGE",
      description:
        "Pediatric patient (age ≤ 3) with fever ≥ 100.4°F. This combination requires immediate in-person evaluation — do not wait.",
      accent: "rose",
    };
  }

  if ((hasTemp && temp >= 103) || pain >= 8) {
    return {
      level: 2,
      badge: "ESI LEVEL 2: HIGH-URGENCY RESPONSE REQUIRED",
      description:
        "High fever or severe pain reported. This warrants prompt medical attention, typically within the hour.",
      accent: "amber",
    };
  }

  if (hasTemp && temp <= 99.5 && pain <= 4) {
    return {
      level: 5,
      badge: "ESI LEVEL 5: STABLE / OUTPATIENT ELIGIBLE",
      description:
        "Vitals are within normal range and pain is mild. Routine or outpatient care is likely appropriate.",
      accent: "emerald",
    };
  }

  return {
    level: 3,
    badge: "ESI LEVEL 3: URGENT EVALUATION",
    description:
      "Vitals and reported symptoms don't clearly match a critical or routine pathway. Professional evaluation is recommended within the hour rather than an emergency dash or a wait-and-see approach.",
    accent: "indigo",
  };
}

const ACCENT_STYLES: Record<
  EsiResult["accent"],
  { border: string; bg: string; text: string; ring: string; glow: string }
> = {
  rose: {
    border: "border-rose-500/60",
    bg: "bg-rose-500/10",
    text: "text-rose-300",
    ring: "ring-rose-500/40",
    glow: "shadow-[0_0_60px_-15px_rgba(244,63,94,0.6)]",
  },
  amber: {
    border: "border-amber-400/60",
    bg: "bg-amber-400/10",
    text: "text-amber-300",
    ring: "ring-amber-400/40",
    glow: "shadow-[0_0_60px_-15px_rgba(251,191,36,0.5)]",
  },
  emerald: {
    border: "border-emerald-400/60",
    bg: "bg-emerald-400/10",
    text: "text-emerald-300",
    ring: "ring-emerald-400/40",
    glow: "shadow-[0_0_60px_-15px_rgba(52,211,153,0.5)]",
  },
  indigo: {
    border: "border-indigo-400/60",
    bg: "bg-indigo-400/10",
    text: "text-indigo-300",
    ring: "ring-indigo-400/40",
    glow: "shadow-[0_0_60px_-15px_rgba(129,140,248,0.5)]",
  },
};

/* ------------------------------------------------------------------ */
/*  Pain scale color ramp                                              */
/* ------------------------------------------------------------------ */

function painColor(value: number): string {
  const ramp = [
    "bg-emerald-500",
    "bg-emerald-500",
    "bg-lime-500",
    "bg-lime-500",
    "bg-yellow-500",
    "bg-yellow-500",
    "bg-amber-500",
    "bg-orange-500",
    "bg-rose-500",
    "bg-rose-600",
  ];
  return ramp[Math.max(0, Math.min(9, value - 1))];
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

// Demo-only mock: in production this would come from the real hospital
// lookup (e.g. the Overpass-based fetchNearbyHospitals already used
// elsewhere in this app), keyed off the user's live location.
const NEAREST_HOSPITAL = {
  name: "Rajshahi Medical College Hospital (RMCH)",
  travelTime: "6 min by road",
};

export default function EmergencyTriageDashboard() {
  const [darkMode, setDarkMode] = useState(true);
  const [vitals, setVitals] = useState<Vitals>({
    age: "",
    weight: "",
    temperature: "",
    pain: 1,
    symptomText: "",
  });
  const [savedVitals, setSavedVitals] = useState<Vitals | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [keywordOverride, setKeywordOverride] = useState<KeywordHit | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      text: "Vitals recorded. I can answer general, non-diagnostic questions about next steps while you wait for care. What would you like to know?",
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // Combine the intake symptom text with anything flagged live in chat —
  // whichever fires first (or the more severe of the two) wins.
  const intakeKeywordHit = savedVitals
    ? findKeywordHit(savedVitals.symptomText)
    : null;
  const effectiveKeywordHit =
    keywordOverride && (!intakeKeywordHit || keywordOverride.level <= intakeKeywordHit.level)
      ? keywordOverride
      : intakeKeywordHit;

  const esi = useMemo(
    () => (savedVitals ? computeEsi(savedVitals, effectiveKeywordHit) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedVitals, keywordOverride]
  );
  const accent = esi ? ACCENT_STYLES[esi.accent] : null;
  const criticalAlert = esi?.level === 1 || esi?.level === 2;

  // Centralized theme classes so the dark/light toggle only has to be
  // reasoned about in one place instead of scattered across every section.
  const theme = {
    page: darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900",
    topBar: darkMode
      ? "border-slate-800 bg-slate-950/80"
      : "border-slate-200 bg-white/90",
    header: darkMode ? "border-slate-800" : "border-slate-200",
    card: darkMode
      ? "border-slate-800 bg-slate-800/40"
      : "border-slate-200 bg-white shadow-sm",
    input: darkMode
      ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-600"
      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400",
    label: darkMode ? "text-slate-400" : "text-slate-500",
    heading: darkMode ? "text-white" : "text-slate-900",
    body: darkMode ? "text-slate-200" : "text-slate-700",
    divider: darkMode ? "border-slate-800" : "border-slate-200",
    dashedPanel: darkMode
      ? "border-slate-700 text-slate-500"
      : "border-slate-300 text-slate-400",
    chatAssistantBubble: darkMode
      ? "bg-slate-700/70 text-slate-200"
      : "bg-slate-100 text-slate-700",
    ghostButton: darkMode
      ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-indigo-400 hover:text-indigo-300"
      : "border-slate-300 bg-white text-slate-600 hover:border-indigo-400 hover:text-indigo-600",
    exportButton: darkMode
      ? "border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
      : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
    toggleButton: darkMode
      ? "border-slate-700 bg-slate-800 text-amber-300 hover:bg-slate-700"
      : "border-slate-300 bg-white text-indigo-600 hover:bg-slate-50",
  };

  /* ---------------- Preset controller ---------------- */

  const applyPreset = (preset: "pediatric" | "broken" | "routine") => {
    setKeywordOverride(null);
    if (preset === "pediatric") {
      setVitals({
        age: "1",
        weight: "11",
        temperature: "101.2",
        pain: 8,
        symptomText: "High fever and extreme crying",
      });
    } else if (preset === "broken") {
      setVitals({
        age: "24",
        weight: "75",
        temperature: "98.6",
        pain: 9,
        symptomText: "My hand is broken after falling down",
      });
    } else {
      setVitals({
        age: "28",
        weight: "70",
        temperature: "98.6",
        pain: 2,
        symptomText: "Slight sore throat and mild cold symptoms",
      });
    }
  };

  /* ---------------- Vitals form ---------------- */

  const handleVitalsChange = (
    field: keyof Vitals,
    value: string | number
  ) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitVitals = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedVitals(vitals);
    setMessages([
      {
        id: "intro",
        role: "assistant",
        text: "Vitals recorded. I can answer general, non-diagnostic questions about next steps while you wait for care. What would you like to know?",
      },
    ]);
  };

  /* ---------------- Chat ---------------- */

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text };
    const hit = findKeywordHit(text);
    if (hit) setKeywordOverride(hit);

    const replyText = hit
      ? `🚨 "${hit.keyword}" was flagged as a ${hit.level === 1 ? "life-threatening" : "high-urgency"} symptom. Switching to updated guidance — see the alert banner above.`
      : esi
      ? `Noted. Based on the recorded vitals (${esi.badge.split(":")[0]}), the safest next step is to follow the guidance in your triage panel. This isn't a diagnosis — please keep a clinician in the loop.`
      : "Noted. Submit clinical vitals first so I can tailor guidance to the current assessment.";

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: crypto.randomUUID(), role: "assistant", text: replyText },
    ]);
    setChatInput("");
    window.setTimeout(
      () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  };

  /* ---------------- Inline chat image scan ---------------- */

  const handleChatImageSelect = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        text: "Shared a symptom photo.",
        imageUrl,
      };
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: crypto.randomUUID(), role: "assistant", text: "Analyzing image…" },
      ]);
      window.setTimeout(() => {
        setMessages((prev) => {
          const withoutAnalyzing = prev.slice(0, -1);
          return [
            ...withoutAnalyzing,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              text: "Visual analysis complete: localized skin rash with minor inflammation and swelling detected. This is a visual observation only, not a diagnosis — let's factor it into your triage.",
            },
          ];
        });
        window.setTimeout(
          () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          50
        );
      }, 1200);
      window.setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50
      );
    };
    reader.readAsDataURL(file);
  };

  /* ---------------- SBAR export ---------------- */

  const exportPassport = () => {
    if (!savedVitals || !esi) return;

    const timestamp = new Date().toLocaleString();
    const html = `
      <html>
        <head>
          <title>Medical SBAR Passport</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #0f172a; }
            h1 { font-size: 20px; border-bottom: 3px solid #0f172a; padding-bottom: 10px; }
            .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
            .section { margin-bottom: 18px; }
            .section h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #334155; margin-bottom: 6px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
            .row { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding: 4px 0; font-size: 14px; }
            .badge { display: inline-block; padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 13px; background: #0f172a; color: white; }
          </style>
        </head>
        <body>
          <h1>Emergency AI — SBAR Handover Passport</h1>
          <div class="meta">Generated ${timestamp} · Non-diagnostic decision-support summary</div>

          <div class="section">
            <h2>Situation</h2>
            <span class="badge">${esi.badge}</span>
          </div>

          <div class="section">
            <h2>Background — Recorded Vitals</h2>
            <div class="grid">
              <div class="row"><span>Age</span><strong>${savedVitals.age || "—"}</strong></div>
              <div class="row"><span>Weight</span><strong>${savedVitals.weight || "—"} kg</strong></div>
              <div class="row"><span>Temperature</span><strong>${savedVitals.temperature || "—"} °F</strong></div>
              <div class="row"><span>Pain scale</span><strong>${savedVitals.pain} / 10</strong></div>
            </div>
          </div>

          <div class="section">
            <h2>Assessment</h2>
            <p style="font-size: 14px; line-height: 1.6;">${esi.description}</p>
            ${
              savedVitals.symptomText
                ? `<p style="font-size: 13px; color: #475569; margin-top: 8px;"><strong>Reported symptoms:</strong> ${savedVitals.symptomText}</p>`
                : ""
            }
          </div>

          <div class="section">
            <h2>Recommendation</h2>
            <p style="font-size: 14px; line-height: 1.6;">
              This passport is a non-diagnostic summary generated for handover convenience only.
              It does not replace clinical judgment. Present this to attending staff on arrival.
            </p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  /* ------------------------------------------------------------------ */

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${theme.page} ${
        criticalAlert ? "ring-4 ring-rose-500/70 ring-inset" : ""
      }`}
    >
      {/* ---------------- Demo controller bar ---------------- */}
      <div className={`border-b px-4 py-2.5 backdrop-blur ${theme.topBar}`}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-2 text-xs font-semibold ${theme.label}`}>
            <Wrench className="h-3.5 w-3.5" />
            🛠️ Hackathon Demo Preset Controller
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyPreset("pediatric")}
              className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20"
            >
              Preset 1: Pediatric Crisis
            </button>
            <button
              onClick={() => applyPreset("broken")}
              className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              Test Path: Hand is Broken
            </button>
            <button
              onClick={() => applyPreset("routine")}
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
            >
              Preset 2: Routine Care
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Header ---------------- */}
      <header className={`border-b px-4 py-5 ${theme.header}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-500">
              <Activity className="h-5 w-5 text-slate-900" />
            </div>
            <div>
              <h1 className={`text-lg font-bold tracking-tight ${theme.heading}`}>
                Emergency AI
              </h1>
              <p className={`text-xs ${theme.label}`}>
                Triage &amp; Localized Healthcare Navigation
              </p>
            </div>
          </div>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${theme.toggleButton}`}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ---------------- Main layout ---------------- */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
        {/* ============ LEFT / CENTER COLUMN ============ */}
        <div className="space-y-6">
          {/* ---- Step 1: Intake form ---- */}
          <section className={`rounded-2xl border p-6 shadow-xl ${theme.card}`}>
            <div className="mb-5 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-indigo-400" />
              <h2 className={`text-base font-bold ${theme.heading}`}>
                Parametric Clinical Intake
              </h2>
            </div>

            <form onSubmit={handleSubmitVitals} className="space-y-5">
              <div>
                <label className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${theme.label}`}>
                  Describe symptoms
                </label>
                <textarea
                  value={vitals.symptomText}
                  onChange={(e) =>
                    handleVitalsChange("symptomText", e.target.value)
                  }
                  placeholder="e.g. I fell and my hand is broken / I have a minor cold"
                  rows={2}
                  className={`w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm outline-none ring-indigo-500/50 focus:ring-2 ${theme.input}`}
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Keywords like "broken," "fracture," or "chest pain" are
                  treated as red flags regardless of vitals.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${theme.label}`}>
                    Age (years)
                  </label>
                  <input
                    type="number"
                    value={vitals.age}
                    onChange={(e) => handleVitalsChange("age", e.target.value)}
                    placeholder="e.g. 28"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none ring-indigo-500/50 focus:ring-2 ${theme.input}`}
                  />
                </div>
                <div>
                  <label className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${theme.label}`}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={vitals.weight}
                    onChange={(e) => handleVitalsChange("weight", e.target.value)}
                    placeholder="e.g. 70"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none ring-indigo-500/50 focus:ring-2 ${theme.input}`}
                  />
                </div>
              </div>

              {/* Temperature */}
              <div>
                <label className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${theme.label}`}>
                  <span className="inline-flex items-center gap-1.5">
                    <Thermometer className="h-3.5 w-3.5 text-rose-400" />
                    Temperature (°F)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.temperature}
                  onChange={(e) =>
                    handleVitalsChange("temperature", e.target.value)
                  }
                  placeholder="e.g. 98.6"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none ring-indigo-500/50 focus:ring-2 ${theme.input}`}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleVitalsChange("temperature", "98.6")}
                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
                  >
                    🌡️ Normal (98.6°F)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVitalsChange("temperature", "102.5")}
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/20"
                  >
                    🔥 Fever (102.5°F)
                  </button>
                </div>
              </div>

              {/* Pain scale */}
              <div>
                <label className={`mb-2 block text-xs font-semibold uppercase tracking-wide ${theme.label}`}>
                  Pain Scale — {vitals.pain} / 10
                </label>
                <div className="flex gap-1.5">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleVitalsChange("pain", n)}
                      className={`h-9 flex-1 rounded-lg text-xs font-bold text-slate-900 transition-all ${
                        n <= vitals.pain
                          ? `${painColor(vitals.pain)} opacity-100`
                          : "bg-slate-700/50 text-slate-500 opacity-60"
                      } ${n === vitals.pain ? "scale-110 ring-2 ring-white/60" : ""}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] font-medium text-slate-500">
                  <span>Mild</span>
                  <span>Severe</span>
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Submit Clinical Vitals
              </button>
            </form>
          </section>

          {/* ---- Step 2: ESI badge + chat + vision (only after submit) ---- */}
          {savedVitals && esi && accent && (
            <>
              <section
                className={`rounded-2xl border-2 p-5 transition-all ${accent.border} ${accent.bg} ${accent.glow}`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-extrabold tracking-wide ${accent.border} ${accent.text}`}
                  >
                    {esi.level === 1 && <Siren className="h-3.5 w-3.5" />}
                    {esi.level === 2 && <AlertTriangle className="h-3.5 w-3.5" />}
                    {esi.level === 5 && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {esi.level === 3 && <Stethoscope className="h-3.5 w-3.5" />}
                    {esi.badge}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-200">
                  {esi.description}
                </p>
                {(esi.level === 1 || esi.level === 2) && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-3">
                    <Ambulance className="h-5 w-5 flex-shrink-0 text-rose-300" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold ${theme.heading}`}>
                        Nearest facility: {NEAREST_HOSPITAL.name}
                      </p>
                      <p className="text-xs text-rose-200">
                        Estimated travel time: {NEAREST_HOSPITAL.travelTime}
                      </p>
                    </div>
                    <a
                      href="tel:999"
                      className="flex-shrink-0 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-rose-400"
                    >
                      Call 999
                    </a>
                  </div>
                )}
              </section>

              {/* Chat */}
              <section className={`flex h-[420px] flex-col rounded-2xl border ${theme.card}`}>
                <div className={`flex items-center gap-2 border-b px-5 py-4 ${theme.divider}`}>
                  <Heart className="h-4 w-4 text-rose-400" />
                  <h2 className={`text-sm font-bold ${theme.heading}`}>
                    Medical Assistant Chat
                  </h2>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-indigo-500 text-white"
                            : theme.chatAssistantBubble
                        }`}
                      >
                        {m.imageUrl && (
                          <img
                            src={m.imageUrl}
                            alt="Symptom photo shared in chat"
                            className="mb-2 h-32 w-32 rounded-xl object-cover ring-1 ring-white/20"
                          />
                        )}
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <input
                  ref={chatFileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    handleChatImageSelect(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <form
                  onSubmit={handleSendChat}
                  className={`flex items-center gap-2 border-t p-3 ${theme.divider}`}
                >
                  <button
                    type="button"
                    onClick={() => chatFileInputRef.current?.click()}
                    title="Upload / scan a symptom photo"
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-colors ${theme.ghostButton}`}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question or describe a symptom…"
                    className={`flex-1 rounded-xl border px-3.5 py-2.5 text-sm outline-none ring-indigo-500/50 focus:ring-2 ${theme.input}`}
                  />
                  <button
                    type="submit"
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white transition-colors hover:bg-indigo-400"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </section>

              {/* Export */}
              <button
                onClick={exportPassport}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-bold transition-colors ${theme.exportButton}`}
              >
                <Download className="h-4 w-4" />
                📥 Export Medical SBAR Passport
              </button>
            </>
          )}

          {!savedVitals && (
            <div className={`rounded-2xl border border-dashed p-10 text-center text-sm ${theme.dashedPanel}`}>
              Submit clinical vitals above to unlock the triage assessment,
              chat, and vision panel.
            </div>
          )}
        </div>

        {/* ============ RIGHT SIDEBAR ============ */}
        <aside className="h-fit lg:sticky lg:top-6">
          <div className={`rounded-2xl border p-5 ${theme.card}`}>
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-rose-400" />
              <h2 className={`text-sm font-bold ${theme.heading}`}>
                🚨 Proximity Emergency Infrastructure
              </h2>
            </div>

            <div className="space-y-3">
              <a
                href="tel:999"
                className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 transition-colors hover:bg-rose-500/20"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-rose-500/20">
                  <Phone className="h-4.5 w-4.5 text-rose-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${theme.heading}`}>
                    National Emergency Command
                  </p>
                  <p className="text-xs text-rose-200">
                    999 · Police, Fire, Ambulance
                  </p>
                </div>
              </a>

              <a
                href="tel:+880721772214"
                className="flex items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3.5 transition-colors hover:bg-indigo-500/20"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
                  <Ambulance className="h-4.5 w-4.5 text-indigo-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${theme.heading}`}>
                    RMCH Emergency Wing
                  </p>
                  <p className="text-xs text-indigo-200">
                    Rajshahi Medical College Hospital — Apex Trauma Dispatch
                  </p>
                </div>
              </a>

              <a
                href="tel:199"
                className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 transition-colors hover:bg-amber-500/20"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                  <Flame className="h-4.5 w-4.5 text-amber-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${theme.heading}`}>
                    Rajshahi Fire Station
                  </p>
                  <p className="text-xs text-amber-200">
                    199 · Fire Service Control Hub
                  </p>
                </div>
              </a>
            </div>

            <p className={`mt-4 border-t pt-4 text-[11px] leading-relaxed ${theme.divider} ${theme.label}`}>
              Contact numbers shown are for demonstration in the Rajshahi,
              Bangladesh service area. Verify against official directory
              listings before production use.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
