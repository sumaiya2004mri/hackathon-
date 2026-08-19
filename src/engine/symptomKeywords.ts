import type { SeverityLevel, ModuleKind } from '../types';

export interface KeywordRule {
  id: string;
  module: ModuleKind | 'all';
  keywords: string[];
  severity: SeverityLevel;
  rationale: string;
}

export const KEYWORD_RULES: KeywordRule[] = [
  // ---------------------------------------------------------------------
  // OBSTETRIC & GYNECOLOGICAL EMERGENCIES (WHO & DGHS Clinical Protocols)
  // ---------------------------------------------------------------------
  {
    id: 'ectopic-pregnancy-warning',
    module: 'all',
    keywords: [
      'ectopic', 'one sided pelvic pain', 'sharp pelvic pain one side',
      'shoulder tip pain', 'pain at tip of shoulder', 'fainting with abdominal pain',
      'spotting with severe pain',
    ],
    severity: 'EMERGENCY',
    rationale: 'Suspected ectopic pregnancy — high risk of internal tubal rupture and severe hemorrhage. Immediate EMERGENCY care required.',
  },
  {
    id: 'pregnancy-heavy-bleeding',
    module: 'pregnancy',
    keywords: [
      'heavy vaginal bleeding', 'soaking pad every hour', 'bleeding with clots',
      'antepartum hemorrhage', 'postpartum bleeding heavy', 'soaking pads',
    ],
    severity: 'EMERGENCY',
    rationale: 'Heavy bleeding in pregnancy or postpartum — potential placenta previa, abruption, or uterine hemorrhage. Treat as EMERGENCY.',
  },
  {
    id: 'pregnancy-preeclampsia-eclampsia',
    module: 'pregnancy',
    keywords: [
      'severe headache', 'blurred vision', 'seeing spots', 'flashing lights vision',
      'pain under right ribs', 'epigastric pain pregnant', 'sudden swelling face hands',
      'preeclampsia', 'eclampsia', 'convulsion pregnant',
    ],
    severity: 'EMERGENCY',
    rationale: 'Preeclampsia/Eclampsia danger signs (high blood pressure, severe headache, visual scotoma, right upper quadrant pain). Treat as EMERGENCY.',
  },
  {
    id: 'pregnancy-reduced-fetal-movement',
    module: 'pregnancy',
    keywords: [
      'reduced fetal movement', 'baby not moving', 'no movement today',
      'fewer kicks than usual', 'baby stopped kicking',
    ],
    severity: 'EMERGENCY',
    rationale: 'Absence or marked reduction in fetal movements requires urgent cardiotocography and ultrasound evaluation. EMERGENCY.',
  },
  {
    id: 'pregnancy-severe-abdominal-pain',
    module: 'pregnancy',
    keywords: [
      'severe abdominal pain', 'sharp stomach pain pregnant', 'stabbing abdominal pain',
      'constant rigid abdomen',
    ],
    severity: 'EMERGENCY',
    rationale: 'Severe abdominal pain in pregnancy indicates possible placental abruption or uterine rupture. Treat as EMERGENCY.',
  },

  // ---------------------------------------------------------------------
  // GENERAL CRITICAL & LIFE-THREATENING SYMPTOMS
  // ---------------------------------------------------------------------
  {
    id: 'fracture-open-compound',
    module: 'all',
    keywords: [
      'compound fracture', 'open fracture', 'bone sticking out',
      'bone through skin', 'bone protruding', 'exposed bone',
    ],
    severity: 'EMERGENCY',
    rationale: 'Open/compound fracture — bone breaches skin. High infection and bleeding risk. Treat as EMERGENCY.',
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
    rationale: 'Fracture with visible deformity or neurovascular impairment. Treat as EMERGENCY.',
  },
  {
    id: 'chest-pain',
    module: 'all',
    keywords: ['chest pain', 'chest pressure', 'chest tightness', 'crushing chest'],
    severity: 'EMERGENCY',
    rationale: 'Chest pain can indicate acute coronary syndrome. Treat as EMERGENCY.',
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
    rationale: 'Stroke warning signs (FAST). Treat as time-critical EMERGENCY.',
  },
  {
    id: 'severe-bleeding',
    module: 'all',
    keywords: ['severe bleeding', 'won\'t stop bleeding', 'heavy bleeding', 'blood spurting', 'deep cut bleeding'],
    severity: 'EMERGENCY',
    rationale: 'Uncontrolled hemorrhage. Treat as EMERGENCY.',
  },
  {
    id: 'breathing-difficulty',
    module: 'all',
    keywords: ['can\'t breathe', 'cannot breathe', 'difficulty breathing', 'gasping for air', 'shortness of breath severe', 'turning blue', 'lips blue'],
    severity: 'EMERGENCY',
    rationale: 'Severe respiratory distress or cyanosis. Treat as EMERGENCY.',
  },
  {
    id: 'unconscious-unresponsive',
    module: 'all',
    keywords: ['unconscious', 'unresponsive', 'not waking up', 'passed out and won\'t wake'],
    severity: 'EMERGENCY',
    rationale: 'Loss of consciousness is an immediate EMERGENCY.',
  },
  {
    id: 'severe-allergic',
    module: 'all',
    keywords: ['throat closing', 'swelling of throat', 'face swelling suddenly', 'anaphylaxis', 'severe allergic reaction'],
    severity: 'EMERGENCY',
    rationale: 'Anaphylactic reaction with airway obstruction risk. Treat as EMERGENCY.',
  },

  // ---------------------------------------------------------------------
  // URGENT SYMPTOMS (Same-Day Clinical Assessment Required)
  // ---------------------------------------------------------------------
  {
    id: 'fracture-suspected-closed',
    module: 'all',
    keywords: [
      'broken bone', 'broken arm', 'broken leg', 'broken wrist', 'broken ankle',
      'broken hip', 'broken finger', 'broken toe', 'fracture', 'fractured',
      'think i broke', 'possible fracture', 'suspected fracture', 'cracked bone',
    ],
    severity: 'URGENT',
    rationale: 'Suspected closed fracture without neurovascular deficit. URGENT — needs X-ray and splinting today.',
  },
  {
    id: 'high-fever-sepsis-warning',
    module: 'all',
    keywords: [
      'high fever', 'fever above 103', 'fever above 39.5', 'persistent high fever',
      'fever with severe chills', 'shivering violently with fever',
    ],
    severity: 'URGENT',
    rationale: 'High fever or rigors — requires same-day medical review to rule out severe infection.',
  },
  {
    id: 'moderate-injury',
    module: 'all',
    keywords: ['sprain', 'twisted ankle', 'moderate cut', 'deep cut not bleeding heavily'],
    severity: 'URGENT',
    rationale: 'Moderate traumatic injury requiring medical evaluation today.',
  },
  {
    id: 'persistent-vomiting',
    module: 'all',
    keywords: ['vomiting repeatedly', 'cannot keep fluids down', 'persistent vomiting'],
    severity: 'URGENT',
    rationale: 'Risk of acute dehydration — same-day clinical care recommended.',
  },

  // ---------------------------------------------------------------------
  // FEMALE HEALTH SYMPTOMS
  // ---------------------------------------------------------------------
  {
    id: 'uti-with-fever-back-pain',
    module: 'female_health',
    keywords: ['painful urination with fever', 'back pain with painful urination', 'kidney pain fever', 'foul urine with fever'],
    severity: 'URGENT',
    rationale: 'Suspected pyelonephritis / upper UTI. Requires urgent same-day antibiotic review.',
  },
  {
    id: 'uti-signs',
    module: 'female_health',
    keywords: ['burning when urinating', 'painful urination', 'frequent urination burning'],
    severity: 'MONITOR',
    rationale: 'Lower UTI symptoms — drink fluids and consult healthcare provider if symptoms persist.',
  },
];

export function matchKeywordRules(text: string, module: ModuleKind): KeywordRule[] {
  const lower = text.toLowerCase();
  return KEYWORD_RULES.filter(
    (r) => (r.module === 'all' || r.module === module) &&
      r.keywords.some((kw) => lower.includes(kw))
  );
}

export const CRITICAL_BANNER_SYMPTOMS: string[] = KEYWORD_RULES
  .filter((r) => r.severity === 'EMERGENCY' && r.module === 'all')
  .map((r) => r.rationale.split(' — ')[0].split('.')[0])
  .filter((v, i, arr) => arr.indexOf(v) === i);
