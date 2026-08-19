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
        <p className="text-sm mt-2">{session.recommendation}</p>
        <div className="flex items-center gap-3 mt-3">
          <VoiceReadout text={`${SEVERITY_LABEL[sev]}. ${session.recommendation}`} />
          <span className="text-xs text-clinical-muted">
            Assessed via {session.aiPass ? 'local rules + AI review' : 'local rules only'}
          </span>
        </div>
      </div>

      {session.aiPass && (
        <details className="card p-3 text-xs text-clinical-muted">
          <summary className="cursor-pointer text-clinical-text">Why this assessment (local + AI reasoning)</summary>
          <p className="mt-2"><strong className="text-clinical-text">Local pass:</strong> {session.localPass.rationale}</p>
          <p className="mt-1"><strong className="text-clinical-text">AI pass:</strong> {session.aiPass.rationale}</p>
        </details>
      )}

      {/* Hospital location & interactive map shown regardless of severity level */}
      <div className="card p-4 border border-clinical-border">
        <h3 className="font-medium text-clinical-text mb-3 flex items-center gap-2">
          <span>🏥</span>
          <span>Nearest Medical Care & Facilities</span>
        </h3>
        <HospitalList district={user.district} />
      </div>
    </div>
  );
}
