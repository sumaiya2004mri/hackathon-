import type { ModuleKind, TriageSession, SeverityLevel } from '../types';
import { runLocalPass, shouldEscalateToAI, recommendationForSeverity } from './ruleEngine';
import { runAIPass, GeminiConfig } from './geminiClient';

const SEVERITY_RANK: Record<SeverityLevel, number> = { EMERGENCY: 3, URGENT: 2, MONITOR: 1, NORMAL: 0 };

export async function runTriage(params: {
  userId: string;
  symptomEntryId: string;
  freeText: string;
  module: ModuleKind;
  geminiConfig?: GeminiConfig;
}): Promise<TriageSession> {
  const { userId, symptomEntryId, freeText, module, geminiConfig } = params;

  const localPass = runLocalPass(freeText, module);
  let aiPass;

  // Token-optimization: only call Gemini if local pass is unsure AND a key
  // is configured. If no key, we stay local-only and are transparent about it.
  if (shouldEscalateToAI(localPass) && geminiConfig) {
    aiPass = await runAIPass(freeText, module, geminiConfig);
  }

  // Final severity = the MORE severe of the two passes, never the less severe
  // — we bias toward caution rather than toward reassurance.
  const finalSeverity: SeverityLevel = aiPass && SEVERITY_RANK[aiPass.severity] > SEVERITY_RANK[localPass.severity]
    ? aiPass.severity
    : localPass.severity;

  const routedToEmergencyFlow = finalSeverity === 'EMERGENCY';

  const session: TriageSession = {
    id: crypto.randomUUID(),
    userId,
    module,
    symptomEntryId,
    localPass,
    aiPass,
    finalSeverity,
    recommendation: recommendationForSeverity(finalSeverity, module),
    routedToEmergencyFlow,
    createdAt: new Date().toISOString(),
  };

  return session;
}
