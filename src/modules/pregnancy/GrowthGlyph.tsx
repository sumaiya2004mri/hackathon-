import { useRef } from 'react';
import type { WeekData } from './fetalGrowthData';

interface GrowthGlyphProps {
  weekData: WeekData;
  onNext: () => void;
  onPrev: () => void;
}

const MILESTONES = [12, 18, 24, 28, 37, 40];

export default function GrowthGlyph({ weekData, onNext, onPrev }: GrowthGlyphProps) {
  const isMilestone = MILESTONES.includes(weekData.week);
  
  const touchStart = useRef<number | null>(null);
  const mouseStart = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) onNext();
      else onPrev();
    }
    touchStart.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStart.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStart.current === null) return;
    const diff = mouseStart.current - e.clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) onNext();
      else onPrev();
    }
    mouseStart.current = null;
  };

  // Compute womb and baby sizes dynamically based on week
  // Week 4 -> tiny dot, Week 40 -> fully grown
  const scaleRatio = (weekData.week - 4) / (40 - 4); // 0 to 1
  const wombScale = 0.85 + scaleRatio * 0.20; // 0.85 to 1.05
  const babySize = 8 + scaleRatio * 52; // 8px to 60px
  const babyColor = isMilestone ? '#0D9488' : '#14B8A6';

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="relative select-none cursor-grab active:cursor-grabbing flex flex-col items-center justify-center p-8 bg-gradient-to-br from-teal-50/20 via-white to-pink-50/10 rounded-2xl border border-clinical-border overflow-hidden min-h-[260px] animate-fade-in"
    >
      {/* Dynamic Womb SVG Background */}
      <svg 
        className={`w-48 h-48 transition-all duration-500 ease-out ${isMilestone ? 'milestone-glow' : ''}`}
        style={{ transform: `scale(${wombScale})` }}
        viewBox="0 0 200 200"
      >
        {/* Outer womb layer */}
        <circle cx="100" cy="100" r="85" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="5 5" />
        {/* Inner lining */}
        <circle cx="100" cy="100" r="75" fill="rgba(13,148,136,0.02)" stroke="rgba(13,148,136,0.1)" strokeWidth="4" />
        
        {/* Baby glow effect */}
        <defs>
          <radialGradient id="babyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={babyColor} stopOpacity="0.8" />
            <stop offset="60%" stopColor={babyColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={babyColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Baby shape representation */}
        <circle 
          cx="100" 
          cy="100" 
          r={babySize} 
          fill="url(#babyGlow)" 
          className="transition-all duration-500 ease-out" 
        />
        
        {/* Nested heart or core dot */}
        <circle 
          cx="100" 
          cy="100" 
          r={Math.max(2, babySize * 0.3)} 
          fill="#0D9488" 
          className="transition-all duration-500 ease-out opacity-80" 
        />
      </svg>

      {/* Dynamic Fruit Badge overlay */}
      <div className="absolute bottom-6 flex flex-col items-center space-y-1">
        <span className="text-xs font-semibold tracking-wider text-clinical-muted uppercase">Week {weekData.week}</span>
        <span className="text-lg font-display font-semibold text-clinical-text">
          {weekData.sizeComparison}
        </span>
      </div>

      {/* Swipe visual hints */}
      <div className="absolute inset-y-0 left-2 flex items-center justify-center opacity-0 hover:opacity-40 transition-opacity">
        <span className="text-clinical-muted text-xl pointer-events-none">‹</span>
      </div>
      <div className="absolute inset-y-0 right-2 flex items-center justify-center opacity-0 hover:opacity-40 transition-opacity">
        <span className="text-clinical-muted text-xl pointer-events-none">›</span>
      </div>
    </div>
  );
}
