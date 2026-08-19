import { useState } from 'react';
import type { TriageSession } from '../../types';
import TriageForm from '../../components/TriageForm';
import ImageUploadAnalysis from '../../components/ImageUploadAnalysis';
import { exportSBARPassport, downloadBlob } from '../../export/exportEngine';
import { useAuth } from '../../auth/AuthContext';

export default function GeneralTriagePage() {
  const { user } = useAuth();
  const [session, setSession] = useState<TriageSession | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Emergency Triage</h1>
        <p className="text-sm text-clinical-muted mt-1">Describe your symptoms below. This works instantly — no login required, ever, for emergencies.</p>
      </div>

      <TriageForm module="general" onSession={setSession} />

      {session && (
        <button
          onClick={() => downloadBlob(exportSBARPassport(session, user), 'sbar-passport.pdf')}
          className="text-xs px-3 py-1.5 rounded-md bg-clinical-panel2 border border-clinical-border"
        >
          Download SBAR passport (bring this to a doctor)
        </button>
      )}

      <div>
        <ImageUploadAnalysis />
      </div>
    </div>
  );
}
