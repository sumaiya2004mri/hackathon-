// ============================================================================
// CANONICAL SYMPTOM KEYWORD DICTIONARY
//
// This is the ONE source of truth for symptom -> severity keyword mapping.
// Both the local rule engine (ruleEngine.ts) AND the Gemini prompt builder
// (geminiClient.ts) import from this file. Previously, fracture/broken-bone
// keywords were hardcoded separately in the local engine and in the AI
// prompt text, and they drifted out of sync (e.g. "compound fracture" was
// EMERGENCY locally but only URGENT in the AI prompt). Never hardcode a
// symptom keyword list anywhere else — extend this dictionary instead.
// ============================================================================

import type { SeverityLevel, ModuleKind } from '../types';

export interface KeywordRule {
  id: string;
  module: ModuleKind | 'all';
  // Any of these substrings matching (case-insensitive) fires the rule
  keywords: string[];
  severity: SeverityLevel;
  rationale: string;
}

export const KEYWORD_RULES: KeywordRule[] = [
  // ---------------------------------------------------------------------
  // FRACTURE / BROKEN BONE — deliberately explicit and exhaustive.
  // This block is the fix for the historical local-vs-AI mismatch bug.
  // ---------------------------------------------------------------------
  {
    id: 'fracture-open-compound',
    module: 'all',
    keywords: [
      'compound fracture', 'open fracture', 'bone sticking out',
      'bone through skin', 'bone protruding', 'exposed bone',
    ],
    severity: 'EMERGENCY',
    rationale: 'Open/compound fracture — bone breaches the skin. High infection and blood-loss risk. Treat as EMERGENCY.',
  },
  {
    id: 'fracture-deformity-or-neurovascular',
    module: 'all',
    keywords: [
      'visibly deformed', 'limb deformity', 'limb at wrong angle',
      'no pulse below', 'numbness below the break', 'cannot feel toes',
      'cannot feel fingers', 'foot is cold and pale', 'hand is cold and pale',
    ],
    severity: 'EMERGENCY',
    rationale: 'Suspected fracture with deformity or signs of impaired circulation/nerve function distal to the injury. Treat as EMERGENCY — risk of permanent damage.',
  },
  {
    id: 'fracture-suspected-closed',
    module: 'all',
    keywords: [
      'broken bone', 'broken arm', 'broken leg', 'broken wrist', 'broken ankle',
      'broken hip', 'broken finger', 'broken toe', 'fracture', 'fractured',
      'think i broke', 'possible fracture', 'suspected fracture', 'cracked bone',
    ],
    severity: 'URGENT',
    rationale: 'Suspected closed fracture without deformity or neurovascular compromise. Needs imaging and a cast/splint same day — URGENT, not necessarily EMERGENCY, unless upgraded by deformity/circulation keywords above.',
  },
  {
    id: 'fracture-hip-elderly',
    module: 'all',
    keywords: ['hip fracture', 'fell and cannot stand', 'fell and cannot walk'],
    severity: 'EMERGENCY',
    rationale: 'Suspected hip fracture or fall with inability to bear weight, especially in older adults, carries high complication risk. Treat as EMERGENCY.',
  },

  // ---------------------------------------------------------------------
  // GENERAL CRITICAL SYMPTOMS (always-visible banner list)
  // ---------------------------------------------------------------------
  {
    id: 'chest-pain',
    module: 'all',
    keywords: ['chest pain', 'chest pressure', 'chest tightness', 'crushing chest'],
    severity: 'EMERGENCY',
    rationale: 'Chest pain can indicate a heart attack. Treat as EMERGENCY until ruled out by a professional.',
  },
  {
    id: 'stroke-signs',
    module: 'all',
    keywords: [
      'face drooping', 'facial droop', 'slurred speech', 'sudden confusion',
      'sudden weakness one side', 'cannot raise arm', 'sudden vision loss',
      'worst headache of my life',
    ],
    severity: 'EMERGENCY',
    rationale: 'Possible stroke (FAST signs) or sudden severe neurological symptom. Treat as EMERGENCY — time-critical.',
  },
  {
    id: 'severe-bleeding',
    module: 'all',
    keywords: ['severe bleeding', 'won\'t stop bleeding', 'heavy bleeding', 'blood spurting', 'deep cut bleeding'],
    severity: 'EMERGENCY',
    rationale: 'Uncontrolled or heavy bleeding is EMERGENCY — risk of hemorrhagic shock.',
  },
  {
    id: 'breathing-difficulty',
    module: 'all',
    keywords: ['can\'t breathe', 'cannot breathe', 'difficulty breathing', 'gasping for air', 'shortness of breath severe', 'turning blue', 'lips blue'],
    severity: 'EMERGENCY',
    rationale: 'Severe breathing difficulty or cyanosis (blue lips) is EMERGENCY.',
  },
  {
    id: 'unconscious-unresponsive',
    module: 'all',
    keywords: ['unconscious', 'unresponsive', 'not waking up', 'passed out and won\'t wake'],
    severity: 'EMERGENCY',
    rationale: 'Loss of consciousness/unresponsiveness is EMERGENCY.',
  },
  {
    id: 'severe-allergic',
    module: 'all',
    keywords: ['throat closing', 'swelling of throat', 'face swelling suddenly', 'anaphylaxis', 'severe allergic reaction'],
    severity: 'EMERGENCY',
    rationale: 'Possible anaphylaxis — airway compromise risk. EMERGENCY.',
  },
  {
    id: 'burns-severe',
    module: 'all',
    keywords: ['severe burn', 'large area burn', 'third degree burn', 'burn covering'],
    severity: 'EMERGENCY',
    rationale: 'Extensive or deep burns are EMERGENCY.',
  },
  {
    id: 'poisoning-overdose',
    module: 'all',
    keywords: ['overdose', 'swallowed poison', 'ingested chemical', 'took too many pills'],
    severity: 'EMERGENCY',
    rationale: 'Suspected poisoning or overdose is EMERGENCY.',
  },
  {
    id: 'seizure',
    module: 'all',
    keywords: ['seizure', 'convulsing', 'fitting'],
    severity: 'EMERGENCY',
    rationale: 'Active seizure is EMERGENCY, especially if first-time, prolonged, or in pregnancy (possible eclampsia).',
  },

  // ---------------------------------------------------------------------
  // MODERATE / URGENT GENERAL SYMPTOMS
  // ---------------------------------------------------------------------
  {
    id: 'high-fever',
    module: 'all',
    keywords: ['high fever', 'fever above 103', 'fever above 39.5', 'persistent high fever'],
    severity: 'URGENT',
    rationale: 'High or persistent fever warrants same-day medical review.',
  },
  {
    id: 'moderate-injury',
    module: 'all',
    keywords: ['sprain', 'twisted ankle', 'moderate cut', 'deep cut not bleeding heavily'],
    severity: 'URGENT',
    rationale: 'Moderate injury — needs medical review but not immediately life-threatening.',
  },
  {
    id: 'persistent-vomiting',
    module: 'all',
    keywords: ['vomiting repeatedly', 'cannot keep fluids down', 'persistent vomiting'],
    severity: 'URGENT',
    rationale: 'Risk of dehydration — same-day medical review recommended.',
  },

  // ---------------------------------------------------------------------
  // PREGNANCY-SPECIFIC DANGER SIGNS — route directly to emergency flow
  // ---------------------------------------------------------------------
  {
    id: 'pregnancy-heavy-bleeding',
    module: 'pregnancy',
    keywords: ['heavy vaginal bleeding', 'soaking pad every hour', 'bleeding with clots'],
    severity: 'EMERGENCY',
    rationale: 'Heavy bleeding in pregnancy can indicate miscarriage, placental abruption, or previa. EMERGENCY.',
  },
  {
    id: 'pregnancy-severe-headache-vision',
    module: 'pregnancy',
    keywords: ['severe headache', 'vision changes', 'blurred vision', 'seeing spots', 'flashing lights vision'],
    severity: 'EMERGENCY',
    rationale: 'Severe headache with visual disturbance in pregnancy is a pre-eclampsia warning sign. EMERGENCY.',
  },
  {
    id: 'pregnancy-reduced-fetal-movement',
    module: 'pregnancy',
    keywords: ['reduced fetal movement', 'baby not moving', 'no movement today', 'fewer kicks than usual'],
    severity: 'URGENT',
    rationale: 'Reduced fetal movement needs prompt clinical assessment (same day) — upgrade to EMERGENCY if no movement felt in several hours past viability.',
  },
  {
    id: 'pregnancy-severe-abdominal-pain',
    module: 'pregnancy',
    keywords: ['severe abdominal pain', 'sharp stomach pain pregnant', 'stabbing abdominal pain'],
    severity: 'EMERGENCY',
    rationale: 'Severe abdominal pain in pregnancy can indicate placental abruption or ectopic pregnancy. EMERGENCY.',
  },
  {
    id: 'pregnancy-preeclampsia-signs',
    module: 'pregnancy',
    keywords: ['sudden swelling face hands', 'severe swelling', 'upper abdominal pain pregnant', 'pain under ribs pregnant'],
    severity: 'EMERGENCY',
    rationale: 'Signs consistent with pre-eclampsia/HELLP. EMERGENCY.',
  },

  // ---------------------------------------------------------------------
  // FEMALE HEALTH — routing only, never diagnostic
  // ---------------------------------------------------------------------
  {
    id: 'uti-signs',
    module: 'female_health',
    keywords: ['burning when urinating', 'painful urination', 'frequent urination burning'],
    severity: 'MONITOR',
    rationale: 'Possible UTI symptoms — informational only, suggest seeing a doctor if persists beyond a day or two.',
  },
  {
    id: 'uti-with-fever-back-pain',
    module: 'female_health',
    keywords: ['painful urination with fever', 'back pain with painful urination', 'kidney pain fever'],
    severity: 'URGENT',
    rationale: 'Possible kidney infection — same-day medical review recommended.',
  },
];

export function matchKeywordRules(text: string, module: ModuleKind): KeywordRule[] {
  const lower = text.toLowerCase();
  return KEYWORD_RULES.filter(
    (r) => (r.module === 'all' || r.module === module) &&
      r.keywords.some((kw) => lower.includes(kw))
  );
}

// Flattened list used to render the always-visible critical symptoms banner
export const CRITICAL_BANNER_SYMPTOMS: string[] = KEYWORD_RULES
  .filter((r) => r.severity === 'EMERGENCY' && r.module === 'all')
  .map((r) => r.rationale.split(' — ')[0].split('.')[0])
  .filter((v, i, arr) => arr.indexOf(v) === i);
