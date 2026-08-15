import type {
  AssessmentInput,
  Hospital,
  UrgencyLevel,
  UrgencyResult,
} from "./types";

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: "h1",
    name: "St. Mary Regional Medical Center",
    type: "Full-service Emergency Room",
    distanceKm: 1.2,
    open: true,
    address: "420 Health Plaza Dr, Springfield",
    phone: "(555) 010-2000",
    emergency: true,
  },
  {
    id: "h2",
    name: "Lakeside Community Hospital",
    type: "General Hospital with ER",
    distanceKm: 2.8,
    open: true,
    address: "88 Lakeshore Blvd, Springfield",
    phone: "(555) 010-2400",
    emergency: true,
  },
  {
    id: "h3",
    name: "Northside Urgent Care Clinic",
    type: "Urgent Care (non-trauma)",
    distanceKm: 0.6,
    open: true,
    address: "12 North Ave, Suite 100, Springfield",
    phone: "(555) 010-2100",
    emergency: false,
  },
  {
    id: "h4",
    name: "Westgate Children's Medical Center",
    type: "Pediatric Emergency",
    distanceKm: 4.1,
    open: false,
    address: "770 Westgate Rd, Springfield",
    phone: "(555) 010-2200",
    emergency: true,
  },
  {
    id: "h5",
    name: "Riverside Family Health Clinic",
    type: "Primary / Walk-in Clinic",
    distanceKm: 3.3,
    open: true,
    address: "305 Riverside Pkwy, Springfield",
    phone: "(555) 010-2300",
    emergency: false,
  },
];

const HIGH_KEYWORDS = [
  "chest pain",
  "stroke",
  "unconscious",
  "breathing",
  "bleeding",
  "seizure",
  "suicidal",
  "choking",
  "drowning",
  "not breathing",
  "paralysis",
  "slurred speech",
  "can't move",
  "cannot move",
  "numbness",
  "fainting",
  "passed out",
];

const MODERATE_KEYWORDS = [
  "fever",
  "vomit",
  "dehydration",
  "infection",
  "rash",
  "dizzy",
  "migraine",
  "abdominal",
  "swelling",
  "wheezing",
  "asthma",
  "pregnant",
];

export function scoreSymptoms(input: AssessmentInput): {
  result: UrgencyResult;
  score: number;
} {
  const reasons: string[] = [];
  const actionSteps: string[] = [];
  let score = 0;

  const text = input.symptoms.toLowerCase();

  if (HIGH_KEYWORDS.some((k) => text.includes(k))) {
    score += 3;
    reasons.push("Your description includes symptoms commonly associated with serious emergencies.");
  }
  if (MODERATE_KEYWORDS.some((k) => text.includes(k))) {
    score += 1;
    reasons.push("Your description mentions symptoms that can indicate a condition needing prompt medical attention.");
  }

  if (input.severity === "severe") {
    score += 3;
    reasons.push("You reported the symptom severity as severe.");
  } else if (input.severity === "moderate") {
    score += 1;
    reasons.push("You reported the symptom severity as moderate.");
  } else {
    reasons.push("You reported the symptom severity as mild.");
  }

  const temp = parseFloat(input.temperature);
  if (!isNaN(temp)) {
    const tempF = input.temperature.includes("c")
      ? (temp * 9) / 5 + 32
      : temp;
    if (tempF >= 103) {
      score += 2;
      reasons.push(`Elevated body temperature (${Math.round(tempF)}°F) is a high-fever reading.`);
    } else if (tempF >= 100.4) {
      score += 1;
      reasons.push(`Body temperature (${Math.round(tempF)}°F) indicates a fever.`);
    }
  }

  const hr = parseInt(input.heartRate, 10);
  if (!isNaN(hr)) {
    if (hr > 120 || hr < 50) {
      score += 2;
      reasons.push(`Heart rate of ${hr} bpm is outside the normal resting range (60–100 bpm).`);
    } else {
      reasons.push(`Heart rate of ${hr} bpm is within the normal resting range.`);
    }
  }

  const spo2 = parseInt(input.oxygenSaturation, 10);
  if (!isNaN(spo2)) {
    if (spo2 < 92) {
      score += 3;
      reasons.push(`Oxygen saturation of ${spo2}% is critically low (normal is 95–100%).`);
    } else if (spo2 < 95) {
      score += 1;
      reasons.push(`Oxygen saturation of ${spo2}% is below the normal range (95–100%).`);
    } else {
      reasons.push(`Oxygen saturation of ${spo2}% is within the normal range.`);
    }
  }

  const age = parseInt(input.age, 10);
  if (!isNaN(age)) {
    if (age >= 65) {
      score += 1;
      reasons.push("Adults 65 and older may be at higher risk for complications.");
    } else if (age <= 2) {
      score += 1;
      reasons.push("Infants and toddlers may require more urgent evaluation.");
    }
  }

  if (input.conditions.length > 0) {
    score += 1;
    reasons.push(`You reported existing conditions: ${input.conditions.join(", ")}.`);
  }

  const dur = input.duration.toLowerCase();
  if (dur.includes("day") || dur.includes("week")) {
    reasons.push("Symptoms have persisted for more than a day — monitor closely for changes.");
  }

  let level: UrgencyLevel;
  if (score >= 5) {
    level = "HIGH";
    actionSteps.push("Call 911 (or your local emergency number) immediately if symptoms are severe or worsening.");
    actionSteps.push("Do not drive yourself — have someone else take you or call an ambulance.");
    actionSteps.push("Stay calm, rest in a safe position, and keep your phone nearby.");
    actionSteps.push("If available, gather any medications you are currently taking for the medical team.");
  } else if (score >= 2) {
    level = "MODERATE";
    actionSteps.push("Contact your primary care provider or visit an urgent care clinic within the next few hours.");
    actionSteps.push("Monitor your symptoms closely; seek emergency care if they worsen.");
    actionSteps.push("Stay hydrated and rest until you can be evaluated.");
    actionSteps.push("Note when symptoms started and how they have changed.");
  } else {
    level = "LOW";
    actionSteps.push("Rest and monitor your symptoms at home.");
    actionSteps.push("Contact your primary care provider if symptoms persist beyond 48 hours or worsen.");
    actionSteps.push("Keep hydrated and avoid strenuous activity until you feel better.");
    actionSteps.push("Schedule a routine check-up if this is a recurring issue.");
  }

  return {
    score,
    result: { level, reasons, actionSteps, source: "local", confidence: "high" },
  };
}

/** Back-compat convenience wrapper used as the offline/fallback path. */
export function analyzeSymptoms(input: AssessmentInput): UrgencyResult {
  return {
    ...scoreSymptoms(input).result,
    source: "local-fallback",
  };
}
