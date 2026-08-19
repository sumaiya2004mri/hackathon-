import type { ModuleKind, TriageSession } from '../types';
import VoiceReadout from './VoiceReadout';
import HospitalList from './HospitalList';
import { useAuth } from '../auth/AuthContext';

const SEVERITY_LABEL: Record<string, string> = {
  EMERGENCY: 'Emergency',
  URGENT: 'Urgent',
  MONITOR: 'Monitor',
  NORMAL: 'Normal',
};

export default function TriageResult({ session, module }: { session: TriageSession; module: ModuleKind }) {
  const { user } = useAuth();
  const sev = session.finalSeverity;

  return (
    <div className="space-y-4">
      <div className={`card p-4 border-l-4`} style={{ borderLeftColor: 'currentColor' }}>
        <div className={`flex items-center gap-2 severity-${sev}`}>
          <span className={`w-2.5 h-2.5 rounded-full bg-severity-${sev}`} />
          <span className="font-display font-semibold text-lg">{SEVERITY_LABEL[sev]}</span>
        </div>
        <p className="text-sm mt-2 text-ink">{session.recommendation}</p>
        <div className="flex items-center gap-3 mt-3">
          <VoiceReadout text={`${SEVERITY_LABEL[sev]}. ${session.recommendation}`} />
          <span className="text-xs text-ink-soft">
            Assessed via {session.aiPass ? 'local rules + AI review' : 'local rules only'}
          </span>
        </div>
      </div>

      {session.aiPass && (
        <details className="card p-3 text-xs text-ink-muted">
          <summary className="press cursor-pointer text-ink">Why this assessment (local + AI reasoning)</summary>
          <p className="mt-2"><strong className="text-ink">Local pass:</strong> {session.localPass.rationale}</p>
          <p className="mt-1"><strong className="text-ink">AI pass:</strong> {session.aiPass.rationale}</p>
        </details>
      )}

      {session.routedToEmergencyFlow && (
        <div className="card p-4 border border-severity-EMERGENCY/40">
          <h3 className="font-medium text-severity-EMERGENCY mb-2">Nearest emergency care</h3>
          <HospitalList district={user.district} />
        </div>
      )}
    </div>
  );
}
