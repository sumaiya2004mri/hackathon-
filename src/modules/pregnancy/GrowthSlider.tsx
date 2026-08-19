import { useState, useEffect } from 'react';
import { FETAL_GROWTH_BY_WEEK, getWeekData, getInterpolatedScale } from './fetalGrowthData';
import GrowthGlyph from './GrowthGlyph';

// Driven off the same week-number state already used elsewhere in the
// pregnancy module (passed in as `currentWeek`), so the label can never
// drift out of sync with the rest of the UI. The slider lets someone
// explore other weeks for education, but always resets to the real
// current week when the module re-mounts.
export default function GrowthSlider({ currentWeek }: { currentWeek: number }) {
  const [displayWeek, setDisplayWeek] = useState(currentWeek);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => setDisplayWeek(currentWeek), [currentWeek]);

  // Cross-fade whenever displayWeek changes — no jump cuts (spec item 3)
  useEffect(() => {
    setTransitioning(true);
    const t = setTimeout(() => setTransitioning(false), 400);
    return () => clearTimeout(t);
  }, [displayWeek]);

  const weekData = getWeekData(displayWeek);
  const scale = getInterpolatedScale(displayWeek);
  const isRealWeek = displayWeek === currentWeek;

  return (
    <div className="card card-pregnancy p-6">
      <div className="flex flex-col items-center text-center">
        <div
          className={`h-32 flex items-center justify-center transition-all duration-[400ms] ease-out ${transitioning ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}
        >
          <GrowthGlyph scale={scale} accent="#3FA79A" />
        </div>

        <p className="font-display font-semibold text-xl text-ink mt-3 capitalize">
          {weekData.sizeComparison}
        </p>
        <p className="text-sm text-ink-muted mt-0.5">Week {displayWeek}{!isRealWeek && ' (preview)'}</p>

        {weekData.milestone && (
          <p className="text-sm text-module-pregnancy mt-2 flex items-center gap-1.5">
            <span aria-hidden="true">✦</span> {weekData.milestone}
          </p>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-soft w-4 text-right">4</span>
          <input
            type="range"
            min={4}
            max={40}
            value={displayWeek}
            onChange={(e) => setDisplayWeek(Number(e.target.value))}
            className="flex-1 accent-[#3FA79A] press"
            aria-label="Explore fetal development by week"
          />
          <span className="text-xs text-ink-soft w-6">40</span>
        </div>
        {!isRealWeek && (
          <button
            onClick={() => setDisplayWeek(currentWeek)}
            className="press mt-3 text-xs px-3 py-1.5 rounded-full bg-module-pregnancyBg text-module-pregnancy"
          >
            Back to your current week ({currentWeek})
          </button>
        )}
      </div>

      <div className="flex justify-between mt-4 text-[10px] text-ink-soft">
        {FETAL_GROWTH_BY_WEEK.filter((_, i) => i % 2 === 0).map((w) => (
          <span key={w.week}>{w.week}</span>
        ))}
      </div>
    </div>
  );
}
