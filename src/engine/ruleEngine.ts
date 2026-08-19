// ============================================================================
// LOCAL RULE ENGINE — "local pass"
//
// Deterministic, offline, zero-cost. Runs on every symptom entry across all
// four modules (general triage / pregnancy / period / female health), which
// is why it's parameterized by ModuleKind rather than duplicated per module.
//
// If this pass reaches HIGH confidence, the AI pass is skipped entirely
// (token-optimization requirement). Confidence is LOW when:
//   - no keyword rule matched at all (ambiguous free text), or
//   - matched rules disagree strongly (e.g. one URGENT + one NORMAL-leaning
//     phrase in the same entry), or
//   - the entry is long/free-form enough that keyword matching alone is
//     unreliable.
// ============================================================================

import type { SeverityLevel, ModuleKind, TriagePass } from '../types';
import { matchKeywordRules, KeywordRule } from './symptomKeywords';

const SEVERITY_RANK: Record<SeverityLevel, number> = {
  EMERGENCY: 3,
  URGENT: 2,
  MONITOR: 1,
  NORMAL: 0,
};

function highestSeverity(rules: KeywordRule[]): SeverityLevel {
  return rules.reduce<SeverityLevel>(
    (acc, r) => (SEVERITY_RANK[r.severity] > SEVERITY_RANK[acc] ? r.severity : acc),
    'NORMAL'
  );
}

export function runLocalPass(freeText: string, module: ModuleKind): TriagePass {
  const matched = matchKeywordRules(freeText, module);

  if (matched.length === 0) {
    // No keyword hit at all — local pass cannot confidently classify.
    // This is the main trigger for escalating to the Gemini AI pass.
    return {
      pass: 'local',
      severity: 'MONITOR',
      matchedRules: [],
      rationale: 'No known critical or urgent keywords detected. Confidence is low because the input did not match the local dictionary — escalating for AI review.',
      confidence: 'low',
    };
  }

  const severity = highestSeverity(matched);
  const hasEmergency = matched.some((r) => r.severity === 'EMERGENCY');
  const hasConflict =
    matched.some((r) => r.severity === 'NORMAL' || r.severity === 'MONITOR') &&
    matched.some((r) => r.severity === 'URGENT' || r.severity === 'EMERGENCY');

  // Any EMERGENCY keyword match is always HIGH confidence — we never want
  // to delay an emergency routing decision behind an AI network call.
  const confidence: 'high' | 'low' = hasEmergency ? 'high' : hasConflict ? 'low' : 'high';

  return {
    pass: 'local',
    severity,
    matchedRules: matched.map((r) => r.id),
    rationale: matched.map((r) => r.rationale).join(' '),
    confidence,
  };
}

export function shouldEscalateToAI(localPass: TriagePass): boolean {
  return localPass.confidence === 'low';
}

export function recommendationForSeverity(severity: SeverityLevel, module: ModuleKind): string {
  const base: Record<SeverityLevel, string> = {
    EMERGENCY: 'This looks like a medical emergency. Call 999 or go to the nearest hospital emergency department now. Do not wait.',
    URGENT: 'This should be seen by a doctor today. Please visit a clinic or hospital outpatient department as soon as you can.',
    MONITOR: 'This is likely not an emergency, but keep track of it. If it gets worse or does not improve in a day or two, see a doctor.',
    NORMAL: 'This appears to be within the range of normal. No action needed right now — mention it at your next routine check-up if you\'re unsure.',
  };
  if (module === 'pregnancy' && severity === 'EMERGENCY') {
    return base.EMERGENCY + ' Bring your ANC card / pregnancy record with you if possible.';
  }
  return base[severity];
}
