export interface WeekData {
  week: number;
  sizeComparison: string;
  lengthCm?: number;
  milestone?: string;
}

export const FETAL_GROWTH_BY_WEEK: WeekData[] = [
  { week: 4, sizeComparison: 'a poppy seed' },
  { week: 6, sizeComparison: 'a lentil', milestone: 'Heartbeat often first detectable on ultrasound' },
  { week: 8, sizeComparison: 'a kidney bean' },
  { week: 10, sizeComparison: 'a strawberry' },
  { week: 12, sizeComparison: 'a lime', milestone: 'End of first trimester' },
  { week: 14, sizeComparison: 'a lemon' },
  { week: 16, sizeComparison: 'an avocado' },
  { week: 18, sizeComparison: 'a bell pepper', milestone: 'Movement (quickening) often first felt' },
  { week: 20, sizeComparison: 'a banana', milestone: 'Halfway point — anatomy scan typically done' },
  { week: 22, sizeComparison: 'a papaya' },
  { week: 24, sizeComparison: 'an ear of corn', milestone: 'Viability milestone — survival outside womb becomes possible with intensive care' },
  { week: 26, sizeComparison: 'a lettuce' },
  { week: 28, sizeComparison: 'an eggplant', milestone: 'Start of third trimester' },
  { week: 30, sizeComparison: 'a large cabbage' },
  { week: 32, sizeComparison: 'a jackfruit (small)' },
  { week: 34, sizeComparison: 'a pineapple' },
  { week: 36, sizeComparison: 'a papaya (large)' },
  { week: 37, sizeComparison: 'a bunch of Swiss chard', milestone: 'Considered early term' },
  { week: 39, sizeComparison: 'a small watermelon', milestone: 'Full term' },
  { week: 40, sizeComparison: 'a small pumpkin', milestone: 'Estimated due date' },
];

export function getWeekData(week: number): WeekData {
  const clamped = Math.max(4, Math.min(40, week));
  let closest = FETAL_GROWTH_BY_WEEK[0];
  for (const w of FETAL_GROWTH_BY_WEEK) {
    if (w.week <= clamped) closest = w;
  }
  return closest;
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
