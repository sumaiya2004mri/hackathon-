// ============================================================================
// SHARED DATA MODEL
// One rule engine + one export engine + one dashboard consume these types
// across all four modules (general triage / pregnancy / period / female health)
// ============================================================================

export type ModuleKind = 'general' | 'pregnancy' | 'period' | 'female_health';

export type SeverityLevel =
  | 'EMERGENCY'   // ESI 1-2 equivalent — route to hospital lookup + 999 banner immediately
  | 'URGENT'      // ESI 3 equivalent — see doctor same day
  | 'MONITOR'     // ESI 4 equivalent — watch, log, revisit if it changes
  | 'NORMAL';     // ESI 5 equivalent / expected variation

export interface EmergencyContact {
  phone: string;
  relationship: string; // e.g. 'Spouse' | 'Parent' | 'Sibling' | 'Friend' | 'Guardian' | 'Other'
}

export interface User {
  id: string;
  isGuest: boolean;
  name?: string;
  age?: number;
  district?: string;        // Bangladesh district, drives localized emergency numbers
  pregnancyStatus?: 'not_pregnant' | 'pregnant' | 'postpartum' | 'unspecified';
  emergencyContact?: EmergencyContact;
  medicalHistoryText?: string; // User entered medical history / background
  medicalHistory?: {
    allergies: string[];
    chronicConditions: string[];
  };
  createdAt: string;
}

export interface Vitals {
  id: string;
  userId: string;
  heartRateBpm?: number;      // manual log
  heartRateSource?: 'manual';
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodGlucoseMgDl?: number;
  capturedAt: string;
}

export interface SymptomEntry {
  id: string;
  userId: string;
  module: ModuleKind;
  freeText: string;
  selectedSymptomKeys: string[];   // canonical keys matched by local rule engine
  createdAt: string;
}

export interface TriagePass {
  pass: 'local' | 'ai';
  severity: SeverityLevel;
  matchedRules: string[];         // rule ids that fired (local pass)
  rationale: string;              // human-readable explanation
  confidence: 'high' | 'low';     // local pass marks 'low' to trigger AI pass
}

export interface TriageSession {
  id: string;
  userId: string;
  module: ModuleKind;
  symptomEntryId: string;
  localPass: TriagePass;
  aiPass?: TriagePass;            // only present if local pass had low confidence
  finalSeverity: SeverityLevel;
  recommendation: string;
  routedToEmergencyFlow: boolean; // true if this session triggered hospital lookup
  hospitalSuggested?: HospitalResult;
  createdAt: string;
}

export interface HospitalResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceKm?: number;
  phone?: string;
  type: 'hospital' | 'clinic' | 'medical_college';
}

export interface PregnancyProfile {
  id: string;
  userId: string;
  lmpDate?: string;          // last menstrual period
  dueDate: string;           // derived or entered directly
  gestationalAgeWeeks: number;
  ancVisits: ANCVisit[];
  ttVaccinations: TTRecord[];
  bpGlucoseLogs: Vitals[];
  kickCounterSessions: KickSession[];
  preferredDeliveryFacility?: HospitalResult;
  hospitalBagChecklist: ChecklistItem[];
}

export interface ANCVisit {
  id: string;
  visitNumber: number;       // 1-4 per BD govt minimum protocol
  scheduledWeek: number;
  completedAt?: string;
  notes?: string;
}

export interface TTRecord {
  doseNumber: 1 | 2 | 3 | 4 | 5;
  scheduledDate: string;
  completedAt?: string;
}

export interface KickSession {
  id: string;
  startedAt: string;
  kickTimestamps: string[];
  durationMinutes: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface PeriodLog {
  id: string;
  userId: string;
  cycleStartDate: string;
  cycleEndDate?: string;
  flowIntensity: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  mood?: string;
  createdAt: string;
}

export interface CycleStats {
  averageCycleLengthDays: number;
  averagePeriodLengthDays: number;
  predictedNextStart: string;
  predictedFertileWindow: [string, string];
  isCurrentCycleIrregular: boolean;
  irregularityNote?: string;
  isLate: boolean;
  daysLate?: number;
}
