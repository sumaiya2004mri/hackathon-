import { Activity, AlertTriangle } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Activity className="h-4 w-4" />
            </span>
            <span className="font-bold text-blue-900">Emergency AI</span>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 sm:text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="max-w-2xl text-left">
              Emergency AI is an informational triage assistance tool. It does
              not diagnose diseases, prescribe medicines, or replace doctors and
              emergency medical professionals. Always seek professional medical
              care when necessary. In a life-threatening emergency, call 999 or
              your local emergency number immediately.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Emergency AI — For informational
            purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
