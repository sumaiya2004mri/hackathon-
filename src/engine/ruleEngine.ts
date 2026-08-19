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

export function runLocalPass(freeText: string, module: ModuleKind, medicalHistoryText?: string): TriagePass {
  const matched = matchKeywordRules(freeText, module);

  let severity = matched.length > 0 ? highestSeverity(matched) : 'MONITOR';
  let historyNote = '';

  // Cross-reference user's Medical History Background for personalized risk assessment
  if (medicalHistoryText && medicalHistoryText.trim().length > 0) {
    const historyLower = medicalHistoryText.toLowerCase();
    const textLower = freeText.toLowerCase();

    // Risk 1: Preeclampsia / Hypertension history + Headache / Vision changes
    if (
      (historyLower.includes('hypertension') || historyLower.includes('preeclampsia') || historyLower.includes('high bp') || historyLower.includes('blood pressure')) &&
      (textLower.includes('headache') || textLower.includes('vision') || textLower.includes('dizzy') || textLower.includes('swelling'))
    ) {
      severity = 'EMERGENCY';
      historyNote = ' [Medical History Correlation]: Your background history of hypertension/pre-eclampsia combined with current symptoms increases risk. Upgraded to EMERGENCY.';
    }
    // Risk 2: Diabetes / Gestational Diabetes + High Fever / Confusion / Vomiting
    else if (
      (historyLower.includes('diabetes') || historyLower.includes('gestational diabetes')) &&
      (textLower.includes('fever') || textLower.includes('vomiting') || textLower.includes('confusion') || textLower.includes('thirst'))
    ) {
      if (SEVERITY_RANK[severity] < SEVERITY_RANK['URGENT']) severity = 'URGENT';
      historyNote = ' [Medical History Correlation]: Diabetic history requires prompt evaluation during fever/illness.';
    }
    // Risk 3: Asthma / Respiratory history + Cough / Shortness of breath
    else if (
      (historyLower.includes('asthma') || historyLower.includes('copd') || historyLower.includes('lung')) &&
      (textLower.includes('breath') || textLower.includes('cough') || textLower.includes('wheezing'))
    ) {
      if (SEVERITY_RANK[severity] < SEVERITY_RANK['URGENT']) severity = 'URGENT';
      historyNote = ' [Medical History Correlation]: Pre-existing respiratory background noted for respiratory symptoms.';
    }
    // Risk 4: Ectopic / C-section / Pelvic surgery history + Pelvic or Abdominal Pain
    else if (
      (historyLower.includes('ectopic') || historyLower.includes('c-section') || historyLower.includes('surgery')) &&
      (textLower.includes('pain') || textLower.includes('cramp') || textLower.includes('bleeding'))
    ) {
      if (SEVERITY_RANK[severity] < SEVERITY_RANK['EMERGENCY'] && (textLower.includes('severe') || textLower.includes('sharp'))) {
        severity = 'EMERGENCY';
      }
      historyNote = ' [Medical History Correlation]: Surgical/obstetric history cross-referenced with abdominal symptoms.';
    }
  }

  if (matched.length === 0 && !historyNote) {
    return {
      pass: 'local',
      severity: 'MONITOR',
      matchedRules: [],
      rationale: 'No known critical or urgent keywords detected. Escalating for AI review.',
      confidence: 'low',
    };
  }

  const hasEmergency = severity === 'EMERGENCY' || matched.some((r) => r.severity === 'EMERGENCY');
  const hasConflict =
    matched.some((r) => r.severity === 'NORMAL' || r.severity === 'MONITOR') &&
    matched.some((r) => r.severity === 'URGENT' || r.severity === 'EMERGENCY');

  const confidence: 'high' | 'low' = hasEmergency ? 'high' : hasConflict ? 'low' : 'high';

  return {
    pass: 'local',
    severity,
    matchedRules: matched.map((r) => r.id),
    rationale: (matched.map((r) => r.rationale).join(' ') || 'Evaluation completed based on clinical rule engine.') + historyNote,
    confidence,
  };
}

export function shouldEscalateToAI(localPass: TriagePass): boolean {
  return localPass.confidence === 'low';
}

export function recommendationForSeverity(severity: SeverityLevel, module: ModuleKind): string {
  const base: Record<SeverityLevel, string> = {
    EMERGENCY: 'This looks like a medical emergency. Call 999 or your saved Emergency Contact immediately. Go to the nearest hospital emergency department now. Do not wait.',
    URGENT: 'This should be evaluated by a doctor today. Please visit a clinic or hospital outpatient department as soon as possible.',
    MONITOR: 'This is likely not an emergency, but monitor closely. If symptoms worsen or fail to improve in 24–48 hours, seek medical advice.',
    NORMAL: 'This appears to be within normal expected variations. No emergency action needed right now — discuss at your next routine checkup if unsure.',
  };
  if (module === 'pregnancy' && severity === 'EMERGENCY') {
    return base.EMERGENCY + ' Bring your ANC card / pregnancy record with you if possible.';
  }
  return base[severity];
}
