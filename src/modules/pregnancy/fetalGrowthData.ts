export interface WeekData {
  week: number;
  sizeComparison: string;
  lengthCm?: number;
  milestone?: string;
  /** 0 (smallest, week 4) to 1 (largest, week 40) — drives the growth SVG's scale transform */
  relativeScale: number;
}

// 10 representative stages (spec: "8-10 stages") that the single growth SVG
// scales/morphs between, rather than a static image per week. relativeScale
// is interpolated for in-between weeks in getWeekData().
export const FETAL_GROWTH_BY_WEEK: WeekData[] = [
  { week: 4, sizeComparison: 'a poppy seed', relativeScale: 0.06 },
  { week: 6, sizeComparison: 'a lentil', milestone: 'Heartbeat often first detectable on ultrasound', relativeScale: 0.10 },
  { week: 8, sizeComparison: 'a kidney bean', relativeScale: 0.15 },
  { week: 10, sizeComparison: 'a strawberry', relativeScale: 0.22 },
  { week: 12, sizeComparison: 'a lime', milestone: 'End of first trimester', relativeScale: 0.30 },
  { week: 16, sizeComparison: 'an avocado', relativeScale: 0.42 },
  { week: 20, sizeComparison: 'a banana', milestone: 'Halfway point — anatomy scan typically done', relativeScale: 0.55 },
  { week: 24, sizeComparison: 'an ear of corn', milestone: 'Viability milestone — survival outside womb becomes possible with intensive care', relativeScale: 0.68 },
  { week: 28, sizeComparison: 'an eggplant', milestone: 'Start of third trimester', relativeScale: 0.80 },
  { week: 32, sizeComparison: 'a jackfruit (small)', relativeScale: 0.90 },
  { week: 36, sizeComparison: 'a papaya (large)', relativeScale: 0.96 },
  { week: 40, sizeComparison: 'a small pumpkin', milestone: 'Estimated due date', relativeScale: 1.0 },
];

// Milestones that fall between the 10 illustrated growth stages — still
// surfaced in the UI even though they don't get their own SVG stage.
const EXTRA_MILESTONES: { week: number; label: string }[] = [
  { week: 18, label: 'Movement (quickening) often first felt' },
];

/** Returns the nearest-at-or-below stage, used for the size-comparison label and milestone text. */
export function getWeekData(week: number): WeekData {
  const clamped = Math.max(4, Math.min(40, week));
  let closest = FETAL_GROWTH_BY_WEEK[0];
  for (const w of FETAL_GROWTH_BY_WEEK) {
    if (w.week <= clamped) closest = w;
  }
  const extra = EXTRA_MILESTONES.find((m) => m.week === clamped);
  return extra ? { ...closest, milestone: extra.label } : closest;
}

/** Interpolated 0-1 scale for smooth cross-fade between the 10 illustrated stages (no jump cuts). */
export function getInterpolatedScale(week: number): number {
  const clamped = Math.max(4, Math.min(40, week));
  for (let i = 0; i < FETAL_GROWTH_BY_WEEK.length - 1; i++) {
    const a = FETAL_GROWTH_BY_WEEK[i];
    const b = FETAL_GROWTH_BY_WEEK[i + 1];
    if (clamped >= a.week && clamped <= b.week) {
      const t = (clamped - a.week) / (b.week - a.week);
      return a.relativeScale + (b.relativeScale - a.relativeScale) * t;
    }
  }
  return FETAL_GROWTH_BY_WEEK[FETAL_GROWTH_BY_WEEK.length - 1].relativeScale;
}

export function gestationalAgeFromLMP(lmpDate: string): number {
  const days = Math.floor((Date.now() - new Date(lmpDate).getTime()) / 86400000);
  return Math.max(0, Math.floor(days / 7));
}

export function dueDateFromLMP(lmpDate: string): string {
  const d = new Date(lmpDate);
  d.setDate(d.getDate() + 280); // Naegele's rule
  return d.toISOString().slice(0, 10);
}
