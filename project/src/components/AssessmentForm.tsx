import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  HeartPulse,
  Loader2,
  Thermometer,
  Activity as ActivityIcon,
  Droplets,
  AlertTriangle,
  X,
} from "lucide-react";
import type { AssessmentInput, Severity } from "../types";
import { CameraHeartRate } from "./CameraHeartRate";
import { CriticalAlertBanner } from "./CriticalAlertBanner";

const COMMON_CONDITIONS = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart disease",
  "Pregnancy",
  "Kidney disease",
  "Compromised immune system",
  "None",
];

const DURATION_OPTIONS = [
  "Less than 1 hour",
  "1–6 hours",
  "6–24 hours",
  "1–3 days",
  "More than 3 days",
  "More than a week",
];

const SEVERITY_OPTIONS: {
  value: Severity;
  label: string;
  desc: string;
  color: string;
  ring: string;
}[] = [
  {
    value: "mild",
    label: "Mild",
    desc: "Noticeable but manageable",
    color: "bg-emerald-50 border-emerald-300 text-emerald-800",
    ring: "ring-emerald-500",
  },
  {
    value: "moderate",
    label: "Moderate",
    desc: "Uncomfortable, affecting daily activity",
    color: "bg-amber-50 border-amber-300 text-amber-800",
    ring: "ring-amber-500",
  },
  {
    value: "severe",
    label: "Severe",
    desc: "Intense, possibly unbearable",
    color: "bg-red-50 border-red-300 text-red-800",
    ring: "ring-red-500",
  },
];

interface Props {
  onBack: () => void;
  onAnalyze: (input: AssessmentInput) => void | Promise<void>;
}

export function AssessmentForm({ onBack, onAnalyze }: Props) {
  const [age, setAge] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [duration, setDuration] = useState("");
  const [tempUnit, setTempUnit] = useState<"F" | "C">("F");
  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCameraHR, setShowCameraHR] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleCondition = (c: string) => {
    if (c === "None") {
      setConditions(["None"]);
      return;
    }
    setConditions((prev) => {
      const filtered = prev.filter((x) => x !== "None");
      return filtered.includes(c)
        ? filtered.filter((x) => x !== c)
        : [...filtered, c];
    });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!age.trim()) e.age = "Please enter your age.";
    else if (isNaN(Number(age)) || Number(age) < 0 || Number(age) > 120)
      e.age = "Please enter a valid age (0–120).";
    if (!symptoms.trim()) e.symptoms = "Please describe your symptoms.";
    else if (symptoms.trim().length < 10)
      e.symptoms = "Please provide a bit more detail (at least 10 characters).";
    if (!severity) e.severity = "Please select a severity level.";
    if (!duration) e.duration = "Please select a duration.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setAnalyzing(true);
    try {
      await onAnalyze({
        age,
        symptoms,
        severity: severity as Severity,
        duration,
        temperature: temperature ? `${temperature}${tempUnit}` : "",
        heartRate,
        oxygenSaturation,
        conditions: conditions.filter((c) => c !== "None"),
        photoDataUrl,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </button>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-blue-900 sm:text-4xl">
          Symptom Assessment
        </h1>
        <p className="mt-2 text-slate-500">
          Tell us about your symptoms to get an urgency estimate and safe
          next-step guidance.
        </p>
      </div>

      <div className="mb-6">
        <CriticalAlertBanner />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Age + Duration */}
        <div className="card p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="age" className="label-text">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                id="age"
                type="number"
                inputMode="numeric"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 34"
                className="input-field"
              />
              {errors.age && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.age}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="duration" className="label-text">
                Duration of Symptoms <span className="text-red-500">*</span>
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="input-field"
              >
                <option value="">Select duration…</option>
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.duration && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.duration}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div className="card p-6">
          <label htmlFor="symptoms" className="label-text">
            Describe Your Symptoms <span className="text-red-500">*</span>
          </label>
          <textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={5}
            placeholder="e.g. I've been experiencing sharp chest pain for the past two hours, with shortness of breath and sweating…"
            className="input-field resize-none"
          />
          {errors.symptoms && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.symptoms}
            </p>
          )}

          {/* Optional symptom photo */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <label className="label-text">
              Photo of visible symptom (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
            />
            {photoDataUrl ? (
              <div className="relative mt-2 inline-block">
                <img
                  src={photoDataUrl}
                  alt="Symptom preview"
                  className="h-28 w-28 rounded-xl object-cover ring-1 ring-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setPhotoDataUrl(undefined)}
                  className="absolute -right-2 -top-2 rounded-full bg-slate-700 p-1 text-white shadow"
                  aria-label="Remove photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-500 transition-colors hover:border-teal-400 hover:text-teal-600"
              >
                <Camera className="h-4 w-4" />
                Add a photo (e.g. rash, swelling, wound)
              </button>
            )}
            <p className="mt-1.5 text-xs text-slate-400">
              A photo lets the AI reasoning consider visible symptoms too.
              Never a substitute for in-person evaluation.
            </p>
          </div>
        </div>

        {/* Severity */}
        <div className="card p-6">
          <label className="label-text">
            Symptom Severity <span className="text-red-500">*</span>
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {SEVERITY_OPTIONS.map((opt) => {
              const selected = severity === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSeverity(opt.value)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    selected
                      ? `${opt.color} ring-2 ${opt.ring} ring-offset-1`
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="block text-base font-bold">{opt.label}</span>
                  <span className="mt-0.5 block text-xs opacity-80">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.severity && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {errors.severity}
            </p>
          )}
        </div>

        {/* Vitals */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-teal-600" />
            <h3 className="font-bold text-blue-900">
              Vitals{" "}
              <span className="ml-1 text-xs font-medium text-slate-400">
                (optional)
              </span>
            </h3>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {/* Temperature */}
            <div>
              <label htmlFor="temp" className="label-text">
                <span className="inline-flex items-center gap-1">
                  <Thermometer className="h-4 w-4 text-teal-600" />
                  Temperature
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  id="temp"
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="e.g. 98.6"
                  className="input-field"
                />
                <div className="flex rounded-xl border border-slate-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setTempUnit("F")}
                    className={`px-3 text-sm font-semibold transition-colors ${
                      tempUnit === "F"
                        ? "bg-teal-600 text-white"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    °F
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempUnit("C")}
                    className={`px-3 text-sm font-semibold transition-colors ${
                      tempUnit === "C"
                        ? "bg-teal-600 text-white"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    °C
                  </button>
                </div>
              </div>
            </div>
            {/* Heart rate */}
            <div>
              <label htmlFor="hr" className="label-text">
                <span className="inline-flex items-center gap-1">
                  <ActivityIcon className="h-4 w-4 text-teal-600" />
                  Heart Rate (bpm)
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  id="hr"
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  placeholder="e.g. 72"
                  className="input-field"
                />
                <button
                  type="button"
                  onClick={() => setShowCameraHR(true)}
                  className="flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-teal-300 bg-teal-50 px-3 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100"
                  title="Measure using your camera"
                >
                  <HeartPulse className="h-4 w-4" />
                  Measure
                </button>
              </div>
            </div>
            {/* Oxygen */}
            <div>
              <label htmlFor="spo2" className="label-text">
                <span className="inline-flex items-center gap-1">
                  <Droplets className="h-4 w-4 text-teal-600" />
                  Oxygen Sat. (%)
                </span>
              </label>
              <input
                id="spo2"
                type="number"
                min={0}
                max={100}
                value={oxygenSaturation}
                onChange={(e) => setOxygenSaturation(e.target.value)}
                placeholder="e.g. 98"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="card p-6">
          <label className="label-text">
            Existing Medical Conditions{" "}
            <span className="text-xs font-medium text-slate-400">
              (optional)
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_CONDITIONS.map((c) => {
              const selected = conditions.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCondition(c)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    selected
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            This tool does not diagnose diseases or prescribe medicines. It
            provides an informational urgency estimate only.
          </p>
        </div>

        {/* Submit */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="submit"
            disabled={analyzing}
            className="btn-primary w-full sm:w-auto"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing Symptoms…
              </>
            ) : (
              <>
                Analyze Symptoms
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
          <p className="text-xs text-slate-400">
            Your information is sent securely for analysis and is not stored
            after your assessment is complete.
          </p>
        </div>
      </form>

      {showCameraHR && (
        <CameraHeartRate
          onDetected={(bpm) => {
            setHeartRate(String(bpm));
            setShowCameraHR(false);
          }}
          onClose={() => setShowCameraHR(false)}
        />
      )}
    </div>
  );
}
