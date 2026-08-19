import { useState } from 'react';
import type { ModuleKind, TriageSession } from '../types';
import { runTriage } from '../engine/triageOrchestrator';
import { useAuth } from '../auth/AuthContext';
import { useGeminiConfig } from '../hooks/useGeminiConfig';
import { saveSession } from '../engine/sessionStore';
import TriageResult from './TriageResult';

const MODULE_PLACEHOLDER: Record<ModuleKind, string> = {
  general: 'Describe what\'s happening — e.g. "sharp chest pain since this morning" or "I think I broke my wrist"',
  pregnancy: 'Describe your symptom — e.g. "severe headache and blurry vision" or "haven\'t felt the baby move today"',
  period: 'Describe your symptom — e.g. "very heavy bleeding" or "severe cramps not helped by usual medicine"',
  female_health: 'Describe your symptom — e.g. "burning when urinating for two days"',
};

// Module color-coding (spec item 1): the primary CTA takes the color of
// whichever module this form is embedded in. Emergency triage uses coral,
// since urgency/attention is exactly what that module is for.
const MODULE_BUTTON_CLASS: Record<ModuleKind, string> = {
  general: 'bg-module-emergency',
  pregnancy: 'bg-module-pregnancy',
  period: 'bg-module-period',
  female_health: 'bg-module-neutral',
};

export default function TriageForm({ module, onSession }: { module: ModuleKind; onSession?: (s: TriageSession) => void }) {
  const { user } = useAuth();
  const geminiConfig = useGeminiConfig();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<TriageSession | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    const result = await runTriage({
      userId: user.id,
      symptomEntryId: crypto.randomUUID(),
      freeText: text,
      module,
      geminiConfig,
    });
    setSession(result);
    await saveSession(user.id, user.isGuest, result);
    onSession?.(result);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={MODULE_PLACEHOLDER[module]}
          rows={3}
          className="w-full bg-white border border-cream-border rounded-lg p-3 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-module-pregnancy/30"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className={`press px-4 py-2 rounded-full text-white font-medium text-sm disabled:opacity-40 ${MODULE_BUTTON_CLASS[module]}`}
        >
          {loading ? 'Checking…' : 'Check symptoms'}
        </button>
        {!geminiConfig && (
          <p className="text-xs text-ink-soft">No Gemini API key configured — running on local rules only. Ambiguous entries will default to a cautious MONITOR recommendation.</p>
        )}
      </form>
      {session && <TriageResult session={session} module={module} />}
    </div>
  );
}
