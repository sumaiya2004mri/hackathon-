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
  Loader2,
  Phone,
  Send,
  Shield,
  Siren,
  Sparkles,
  Stethoscope,
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
}

type EsiLevel = 1 | 2 | 5 | null;

interface EsiResult {
  level: EsiLevel;
  badge: string;
  description: string;
  accent: "rose" | "amber" | "emerald";
}

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

type PhotoState = "idle" | "loading" | "done";

/* ------------------------------------------------------------------ */
/*  Deterministic ESI triage logic                                     */
/* ------------------------------------------------------------------ */

function computeEsi(vitals: Vitals): EsiResult {
  const age = parseFloat(vitals.age);
  const temp = parseFloat(vitals.temperature);
  const pain = vitals.pain;

  const hasAge = !Number.isNaN(age);
  const hasTemp = !Number.isNaN(temp);

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
    level: null,
    badge: "ESI ASSESSMENT PENDING",
    description:
      "Vitals don't clearly match a preset pathway — a clinician should review the full picture.",
    accent: "amber",
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

export default function EmergencyTriageDashboard() {
  const [vitals, setVitals] = useState<Vitals>({
    age: "",
    weight: "",
    temperature: "",
    pain: 1,
  });
  const [savedVitals, setSavedVitals] = useState<Vitals | null>(null);
  const [photoState, setPhotoState] = useState<PhotoState>("idle");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      text: "Vitals recorded. I can answer general, non-diagnostic questions about next steps while you wait for care. What would you like to know?",
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const esi = useMemo(
    () => (savedVitals ? computeEsi(savedVitals) : null),
    [savedVitals]
  );
  const accent = esi ? ACCENT_STYLES[esi.accent] : null;
  const pediatricRedAlert = esi?.level === 1;

  /* ---------------- Preset controller ---------------- */

  const applyPreset = (preset: "pediatric" | "routine") => {
    if (preset === "pediatric") {
      setVitals({ age: "1", weight: "11", temperature: "101.2", pain: 8 });
    } else {
      setVitals({ age: "28", weight: "70", temperature: "98.6", pain: 2 });
    }
  };

  /* ---------------- Vitals form ---------------- */

  const handleVitalsChange = (field: keyof Vitals, value: string | number) => {
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

  /* ---------------- Mock vision scan ---------------- */

  const handlePhotoUpload = () => {
    setPhotoState("loading");
    window.setTimeout(() => setPhotoState("done"), 1000);
  };

  /* ---------------- Chat ---------------- */

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text };
    const replyText = esi
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
      className={`min-h-screen bg-slate-900 text-slate-100 transition-shadow duration-700 ${
        pediatricRedAlert ? "ring-4 ring-rose-500/70 ring-inset" : ""
      }`}
    >
      {/* ---------------- Demo controller bar ---------------- */}
      <div className="border-b border-slate-800 bg-slate-950/80 px-4 py-2.5 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
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
              onClick={() => applyPreset("routine")}
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
            >
              Preset 2: Routine Care
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Header ---------------- */}
      <header className="border-b border-slate-800 px-4 py-5">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-500">
            <Activity className="h-5 w-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Emergency AI
            </h1>
            <p className="text-xs text-slate-400">
              Triage &amp; Localized Healthcare Navigation
            </p>
          </div>
        </div>
      </header>

      {/* ---------------- Main layout ---------------- */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
        {/* ============ LEFT / CENTER COLUMN ============ */}
        <div className="space-y-6">
          {/* ---- Step 1: Intake form ---- */}
          <section className="rounded-2xl border border-slate-800 bg-slate-800/40 p-6 shadow-xl">
            <div className="mb-5 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">
                Parametric Clinical Intake
              </h2>
            </div>

            <form onSubmit={handleSubmitVitals} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    value={vitals.age}
                    onChange={(e) => handleVitalsChange("age", e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 outline-none ring-indigo-500/50 placeholder:text-slate-600 focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={vitals.weight}
                    onChange={(e) => handleVitalsChange("weight", e.target.value)}
                    placeholder="e.g. 70"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 outline-none ring-indigo-500/50 placeholder:text-slate-600 focus:ring-2"
                  />
                </div>
              </div>

              {/* Temperature */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 outline-none ring-indigo-500/50 placeholder:text-slate-600 focus:ring-2"
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
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
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
                    {esi.badge}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-200">
                  {esi.description}
                </p>
              </section>

              {/* Vision scan */}
              <section className="rounded-2xl border border-slate-800 bg-slate-800/40 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-indigo-400" />
                  <h2 className="text-base font-bold text-white">
                    Multimodal Symptom Vision
                  </h2>
                </div>

                {photoState === "idle" && (
                  <button
                    onClick={handlePhotoUpload}
                    className="flex items-center gap-2 rounded-xl border border-dashed border-slate-600 px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-indigo-400 hover:text-indigo-300"
                  >
                    📸 Upload/Scan Symptom Photo
                  </button>
                )}

                {photoState === "loading" && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing image…
                  </div>
                )}

                {photoState === "done" && (
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 ring-1 ring-slate-600">
                      <Camera className="h-7 w-7 text-slate-400" />
                    </div>
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">
                      <span className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-indigo-300">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Vision Scan
                      </span>
                      Localized dermal inflammation and swelling recognized.
                    </div>
                  </div>
                )}
              </section>

              {/* Chat */}
              <section className="flex h-[420px] flex-col rounded-2xl border border-slate-800 bg-slate-800/40">
                <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
                  <Heart className="h-4 w-4 text-rose-400" />
                  <h2 className="text-sm font-bold text-white">
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
                            : "bg-slate-700/70 text-slate-200"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form
                  onSubmit={handleSendChat}
                  className="flex items-center gap-2 border-t border-slate-800 p-3"
                >
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a general question…"
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 outline-none ring-indigo-500/50 placeholder:text-slate-600 focus:ring-2"
                  />
                  <button
                    type="submit"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white transition-colors hover:bg-indigo-400"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </section>

              {/* Export */}
              <button
                onClick={exportPassport}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-4 text-sm font-bold text-white transition-colors hover:bg-slate-700"
              >
                <Download className="h-4 w-4" />
                📥 Export Medical SBAR Passport
              </button>
            </>
          )}

          {!savedVitals && (
            <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-500">
              Submit clinical vitals above to unlock the triage assessment,
              chat, and vision panel.
            </div>
          )}
        </div>

        {/* ============ RIGHT SIDEBAR ============ */}
        <aside className="h-fit lg:sticky lg:top-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-rose-400" />
              <h2 className="text-sm font-bold text-white">
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
                  <p className="text-sm font-bold text-white">
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
                  <p className="text-sm font-bold text-white">
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
                  <p className="text-sm font-bold text-white">
                    Rajshahi Fire Station
                  </p>
                  <p className="text-xs text-amber-200">
                    199 · Fire Service Control Hub
                  </p>
                </div>
              </a>
            </div>

            <p className="mt-4 border-t border-slate-800 pt-4 text-[11px] leading-relaxed text-slate-500">
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
