import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ListChecks,
  MapPin,
  Phone,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Volume2,
  WifiOff,
} from "lucide-react";
import type { UrgencyResult } from "../types";
import { EmergencyBanner } from "./EmergencyBanner";

interface Props {
  result: UrgencyResult;
  onBack: () => void;
  onFindHospitals: () => void;
  onRestart: () => void;
}

const URGENCY_CONFIG = {
  HIGH: {
    label: "HIGH URGENCY",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-600 text-white",
    text: "text-red-700",
    icon: ShieldAlert,
    summary:
      "Your symptoms suggest a potentially serious situation. You should seek emergency medical care immediately.",
  },
  MODERATE: {
    label: "MODERATE URGENCY",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-500 text-white",
    text: "text-amber-700",
    icon: AlertTriangle,
    summary:
      "Your symptoms suggest you should seek medical attention soon, but it may not require an emergency room visit.",
  },
  LOW: {
    label: "LOW URGENCY",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-600 text-white",
    text: "text-emerald-700",
    icon: CheckCircle2,
    summary:
      "Your symptoms appear manageable with self-care and monitoring, but stay alert for any changes.",
  },
} as const;

export function ResultsView({
  result,
  onBack,
  onFindHospitals,
  onRestart,
}: Props) {
  const cfg = URGENCY_CONFIG[result.level];
  const Icon = cfg.icon;
  const isHigh = result.level === "HIGH";

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Urgency Card */}
      <div
        className={`animate-slide-up rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-6 sm:p-8`}
      >
        <div className="flex flex-col items-center text-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full ${cfg.badge} px-5 py-2 text-sm font-bold uppercase tracking-wider shadow-sm`}
          >
            <Icon className="h-4 w-4" />
            {cfg.label}
          </span>
          <p className={`mt-4 max-w-lg text-lg font-semibold ${cfg.text}`}>
            {cfg.summary}
          </p>
        </div>
      </div>

      {/* Source & confidence transparency */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
          <Sparkles className="h-3 w-3" />
          {result.source === "ai"
            ? "AI-analyzed (ESI-informed)"
            : "Local safety engine"}
        </span>
        {result.confidence && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
            Confidence: {result.confidence}
          </span>
        )}
      </div>

      {result.source === "local-fallback" && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <WifiOff className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            The AI service wasn't reachable, so this result comes from the
            offline, deterministic safety engine instead. It's built to be
            equally cautious, but couldn't apply AI-level reasoning to your
            specific wording.
          </p>
        </div>
      )}

      {/* Persistent emergency banner for HIGH */}
      {isHigh && (
        <div className="mt-6">
          <EmergencyBanner />
        </div>
      )}

      {/* Why this urgency */}
      <div className="card mt-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-bold text-blue-900">
            Why This Urgency Level?
          </h2>
        </div>
        <ul className="space-y-3">
          {result.reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1 flex h-2 w-2 flex-shrink-0 rounded-full bg-teal-500" />
              <span className="text-sm leading-relaxed text-slate-600">
                {reason}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action steps */}
      <div className="card mt-6 p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-bold text-blue-900">
              Recommended Next Steps
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!("speechSynthesis" in window)) return;
              const utterance = new SpeechSynthesisUtterance(
                result.actionSteps.join(". ")
              );
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(utterance);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-50"
            title="Read steps aloud — useful when your hands are busy helping someone"
          >
            <Volume2 className="h-3.5 w-3.5" />
            Read aloud
          </button>
        </div>
        <ol className="space-y-4">
          {result.actionSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                {i + 1}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed text-slate-700">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Not a diagnosis warning */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <div>
          <p className="font-bold text-amber-900">
            This is not a medical diagnosis.
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Emergency AI provides an informational urgency estimate only. It
            does not replace evaluation by a qualified medical professional.
            If your symptoms worsen or you feel unsure, seek care immediately.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button onClick={onFindHospitals} className="btn-primary w-full sm:w-auto">
          <MapPin className="h-5 w-5" />
          Find Nearby Hospitals
        </button>
        <button onClick={onRestart} className="btn-secondary w-full sm:w-auto">
          <RotateCcw className="h-5 w-5" />
          Start New Assessment
        </button>
      </div>

      {/* Quick call link for non-high too */}
      {!isHigh && (
        <p className="mt-4 text-center text-sm text-slate-400">
          In a life-threatening emergency, call{" "}
          <a
            href="tel:911"
            className="inline-flex items-center gap-0.5 font-bold text-red-600 hover:underline"
          >
            <Phone className="h-3.5 w-3.5" />
            911
          </a>{" "}
          immediately.
        </p>
      )}
    </div>
  );
}
