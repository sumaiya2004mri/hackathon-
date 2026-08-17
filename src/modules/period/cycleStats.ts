import type { PeriodLog, CycleStats } from '../../types';

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function computeCycleStats(logs: PeriodLog[]): CycleStats {
  const sorted = [...logs].sort((a, b) => a.cycleStartDate.localeCompare(b.cycleStartDate));

  if (sorted.length < 2) {
    // Not enough history — use clinical defaults, flagged as such by caller
    const last = sorted[sorted.length - 1];
    const predictedNextStart = last ? addDays(last.cycleStartDate, 28) : new Date().toISOString().slice(0, 10);
    return {
      averageCycleLengthDays: 28,
      averagePeriodLengthDays: 5,
      predictedNextStart,
      predictedFertileWindow: [addDays(predictedNextStart, -18), addDays(predictedNextStart, -12)],
      isCurrentCycleIrregular: false,
      isLate: false,
    };
  }

  const cycleLengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    cycleLengths.push(daysBetween(sorted[i - 1].cycleStartDate, sorted[i].cycleStartDate));
  }
  const periodLengths = sorted
    .filter((l) => l.cycleEndDate)
    .map((l) => daysBetween(l.cycleStartDate, l.cycleEndDate!) + 1);

  const avgCycle = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
  const avgPeriod = periodLengths.length
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : 5;

  // Personal-average-based irregularity: compare the MOST RECENT cycle length
  // to this person's own historical average, not a fixed 28-day calendar rule.
  const lastCycleLength = cycleLengths[cycleLengths.length - 1];
  const deviation = Math.abs(lastCycleLength - avgCycle);
  const isCurrentCycleIrregular = deviation >= 7; // >= 1 week off personal average

  const lastStart = sorted[sorted.length - 1].cycleStartDate;
  const predictedNextStart = addDays(lastStart, avgCycle);
  const ovulationDay = addDays(predictedNextStart, -14);
  const predictedFertileWindow: [string, string] = [addDays(ovulationDay, -5), addDays(ovulationDay, 1)];

  const today = new Date().toISOString().slice(0, 10);
  const daysLate = daysBetween(predictedNextStart, today);
  const isLate = daysLate > 3; // grace window before nudging

  return {
    averageCycleLengthDays: avgCycle,
    averagePeriodLengthDays: avgPeriod,
    predictedNextStart,
    predictedFertileWindow,
    isCurrentCycleIrregular,
    irregularityNote: isCurrentCycleIrregular
      ? `This cycle was ${lastCycleLength} days — a bit different from your usual average of ${avgCycle} days. That's often just stress or normal variation, but worth mentioning at your next checkup if it keeps happening.`
      : undefined,
    isLate,
    daysLate: isLate ? daysLate : undefined,
  };
}
