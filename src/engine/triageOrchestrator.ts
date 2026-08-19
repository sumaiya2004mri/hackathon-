import type { ModuleKind, TriageSession, SeverityLevel, User } from '../types';
import { runLocalPass, shouldEscalateToAI, recommendationForSeverity } from './ruleEngine';
import { runAIPass, GeminiConfig } from './geminiClient';

const SEVERITY_RANK: Record<SeverityLevel, number> = { EMERGENCY: 3, URGENT: 2, MONITOR: 1, NORMAL: 0 };

export async function runTriage(params: {
  userId: string;
  user?: User;
  symptomEntryId: string;
  freeText: string;
  module: ModuleKind;
  geminiConfig?: GeminiConfig;
}): Promise<TriageSession> {
  const { userId, user, symptomEntryId, freeText, module, geminiConfig } = params;

  const medicalHistoryText = user?.medicalHistoryText ||
    (user?.medicalHistory ? `Allergies: ${user.medicalHistory.allergies?.join(', ')}. Conditions: ${user.medicalHistory.chronicConditions?.join(', ')}` : undefined);

  const localPass = runLocalPass(freeText, module, medicalHistoryText);
  let aiPass;

  if (shouldEscalateToAI(localPass) && geminiConfig) {
    aiPass = await runAIPass(freeText, module, geminiConfig);
  }

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
