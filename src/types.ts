export type View = "home" | "assessment" | "results" | "hospitals";

export type Severity = "mild" | "moderate" | "severe";

export type UrgencyLevel = "LOW" | "MODERATE" | "HIGH";

export interface AssessmentInput {
  age: string;
  symptoms: string;
  severity: Severity;
  duration: string;
  temperature: string;
  heartRate: string;
  oxygenSaturation: string;
  conditions: string[];
  photoDataUrl?: string;
}

export type ResultSource = "ai" | "local" | "local-fallback";
export type Confidence = "high" | "medium" | "low";

export interface UrgencyResult {
  level: UrgencyLevel;
  reasons: string[];
  actionSteps: string[];
  confidence?: Confidence;
  source?: ResultSource;
}

export interface Hospital {
  id: string;
  name: string;
  type: string;
  distanceKm: number;
  open: boolean;
  address: string;
  phone: string;
  emergency: boolean;
}
