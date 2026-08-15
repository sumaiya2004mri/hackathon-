import { Activity, AlertTriangle } from "lucide-react";

export function SafetyDisclaimer() {
  return (
    <div className="flex items-center justify-center gap-2 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800 sm:text-sm">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>
        Informational triage tool only — not a medical diagnosis. Always seek
        professional medical care in an emergency.
      </span>
    </div>
  );
}

export function Navbar({
  onNavigate,
}: {
  onNavigate: (view: "home" | "dashboard") => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-left transition-opacity hover:opacity-80"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
            <Activity className="h-5 w-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-base font-bold leading-tight text-blue-900">
              Emergency AI
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Triage &amp; Navigation
            </span>
          </span>
        </button>
        <div className="hidden items-center gap-3 sm:flex">
          <button
            onClick={() => onNavigate("dashboard")}
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
          >
            Clinical Dashboard Demo
          </button>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            Not a substitute for 999
          </span>
        </div>
      </div>
    </header>
  );
}
