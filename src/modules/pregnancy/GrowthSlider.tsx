import { useRef, useState, useEffect } from 'react';
import { FETAL_GROWTH_BY_WEEK } from './fetalGrowthData';

interface GrowthSliderProps {
  currentWeek: number;
  selectedWeek: number;
  onWeekChange: (week: number) => void;
}

const MILESTONES = [12, 18, 24, 28, 37, 40];

export default function GrowthSlider({ currentWeek, selectedWeek, onWeekChange }: GrowthSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Auto-play stepper
  useEffect(() => {
    let intervalId: any;
    if (isPlaying) {
      intervalId = setInterval(() => {
        const currentIndex = FETAL_GROWTH_BY_WEEK.findIndex((w) => w.week === selectedWeek);
        const nextIndex = (currentIndex + 1) % FETAL_GROWTH_BY_WEEK.length;
        onWeekChange(FETAL_GROWTH_BY_WEEK[nextIndex].week);
      }, 1500);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying, selectedWeek, onWeekChange]);

  const handleTrackInteraction = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetWeek = 4 + pct * (40 - 4);

    let closestWeek = FETAL_GROWTH_BY_WEEK[0].week;
    let minDiff = Infinity;
    for (const w of FETAL_GROWTH_BY_WEEK) {
      const diff = Math.abs(w.week - targetWeek);
      if (diff < minDiff) {
        minDiff = diff;
        closestWeek = w.week;
      }
    }
    onWeekChange(closestWeek);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPlaying(false);
    setIsDragging(true);
    handleTrackInteraction(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleTrackInteraction(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPlaying(false);
    setIsDragging(true);
    handleTrackInteraction(e.touches[0].clientX);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      handleTrackInteraction(moveEvent.touches[0].clientX);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const scaleRatio = (selectedWeek - 4) / (40 - 4);
  const percentage = scaleRatio * 100;
  const isMilestone = MILESTONES.includes(selectedWeek);

  return (
    <div className="space-y-4 py-2 animate-fade-in">
      <div className="flex items-center justify-between">
        {/* Play/Pause controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center justify-center p-2 rounded-full border transition-all ${
              isPlaying
                ? 'bg-pink-100 text-maternal-primary border-pink-300'
                : 'bg-maternal-blush border-maternal-border text-maternal-muted hover:text-maternal-primary'
            }`}
            aria-label={isPlaying ? 'Pause auto-play' : 'Play auto-play'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <span className="text-xs text-maternal-muted font-medium">
            {isPlaying ? 'Playing timeline...' : 'Auto-play timeline'}
          </span>
        </div>

        {/* Back to current week action */}
        {selectedWeek !== currentWeek && (
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              onWeekChange(currentWeek);
            }}
            className="text-xs font-semibold text-maternal-primary hover:underline"
          >
            Back to current week (Week {currentWeek})
          </button>
        )}
      </div>

      {/* Custom Slider Track */}
      <div className="relative pt-4 pb-6 px-3">
        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="relative h-2.5 bg-pink-100/80 rounded-full cursor-pointer select-none border border-pink-200/50"
        >
          {/* Active track bar fill */}
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-pink-400 to-maternal-primary rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />

          {/* Interactive Stage markers (dots along track) */}
          {FETAL_GROWTH_BY_WEEK.map((item) => {
            const dotPct = ((item.week - 4) / (40 - 4)) * 100;
            const isActive = item.week <= selectedWeek;
            const isMilestoneDot = MILESTONES.includes(item.week);

            return (
              <button
                key={item.week}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(false);
                  onWeekChange(item.week);
                }}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 focus:outline-none transition-all duration-300 hover:scale-125 z-10 ${
                  isActive
                    ? 'bg-maternal-primary border-maternal-primary scale-110'
                    : 'bg-white border-pink-300'
                } ${
                  isMilestoneDot
                    ? 'w-3.5 h-3.5 rounded-md border-2 rotate-45 ring-4 ring-pink-500/10'
                    : 'w-2.5 h-2.5 rounded-full border'
                }`}
                style={{ left: `${dotPct}%` }}
                title={`Week ${item.week}`}
              />
            );
          })}

          {/* Drag Handle */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-maternal-primary shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 z-20 ${
              isDragging ? 'cursor-grabbing scale-110' : ''
            }`}
            style={{
              left: `${percentage}%`,
              transition: isDragging || isPlaying ? 'none' : 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className={`w-2.5 h-2.5 rounded-full bg-maternal-primary ${isMilestone ? 'animate-ping' : ''}`} />
          </div>
        </div>
      </div>

      <input
        type="range"
        min="4"
        max="40"
        value={selectedWeek}
        onChange={(e) => onWeekChange(Number(e.target.value))}
        className="sr-only"
        aria-label="Gestational age in weeks"
      />
    </div>
  );
}
