import React, { useRef, useState } from 'react';
import type { WeekData } from './fetalGrowthData';

interface GrowthGlyphProps {
  weekData: WeekData;
  onNext: () => void;
  onPrev: () => void;
}

const MILESTONES = [12, 18, 24, 28, 37, 40];

export default function GrowthGlyph({ weekData, onNext, onPrev }: GrowthGlyphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Tilt state
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Heartbeat pulse state
  const [heartbeatActive, setHeartbeatActive] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // Gesture handling
  const touchStart = useRef<number | null>(null);

  // 3D Mouse Parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateY = (x / (rect.width / 2)) * 12; // deg
    const rotateX = (-y / (rect.height / 2)) * 12; // deg
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

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

  // Play subtle heartbeat audio pulse on tap if enabled
  const triggerHeartbeat = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(70, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  };

  // Compute fetal scale according to week
  const scaleRatio = (weekData.week - 4) / (40 - 4);
  const embryoScale = 0.75 + scaleRatio * 0.35; // 0.75x to 1.1x

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative select-none flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-teal-500/30 overflow-hidden min-h-[360px] shadow-2xl transition-all duration-300 group"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Background ambient lighting and fluid glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/30 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Floating 3D particles in amniotic sac */}
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute w-2 h-2 rounded-full bg-teal-400/40 animate-ping top-1/4 left-1/4" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300/50 top-2/3 right-1/3 animate-bounce" />
        <div className="absolute w-1 h-1 rounded-full bg-teal-200/60 bottom-1/4 left-1/3 animate-pulse" />
      </div>

      {/* 3D Glassmorphic Fetal Capsule Container */}
      <div
        className="relative z-10 flex flex-col items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${isHovered ? 1.03 : 1})`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glowing Heartbeat Ring */}
        <div
          className={`absolute rounded-full border border-teal-400/30 transition-all duration-500 ${
            heartbeatActive ? 'animate-ping opacity-40' : 'opacity-0'
          }`}
          style={{
            width: `${180 * embryoScale}px`,
            height: `${240 * embryoScale}px`,
          }}
        />

        {/* Translucent Fetal Glass Capsule */}
        <div
          className="relative rounded-full overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(13,148,136,0.35)] backdrop-blur-md bg-gradient-to-b from-white/10 via-teal-950/20 to-black/60 transition-transform duration-500 cursor-pointer"
          style={{
            width: `${210 * embryoScale}px`,
            height: `${270 * embryoScale}px`,
          }}
          onClick={() => {
            triggerHeartbeat();
            setHeartbeatActive(!heartbeatActive);
          }}
        >
          {/* Glass light reflection highlights */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-teal-300/20 pointer-events-none z-20" />

          {/* Photorealistic 3D Translucent Glass Fetus */}
          <img
            src="/glass_fetal_embryo_3d.jpg"
            alt={`3D Fetal visualization week ${weekData.week}`}
            className="w-full h-full object-cover rounded-full mix-blend-screen opacity-90 transition-transform duration-500 group-hover:scale-105"
          />

          {/* Interactive Anatomical Hotspots */}
          <button
            title="Fetal Heartbeat"
            onClick={(e) => {
              e.stopPropagation();
              triggerHeartbeat();
              setActiveHotspot(activeHotspot === 'heart' ? null : 'heart');
            }}
            className="absolute top-[42%] left-[45%] z-30 w-4 h-4 rounded-full bg-teal-400/80 border border-white animate-pulse shadow-[0_0_12px_#0d9488]"
          />

          <button
            title="Neural & Brain Development"
            onClick={(e) => {
              e.stopPropagation();
              setActiveHotspot(activeHotspot === 'brain' ? null : 'brain');
            }}
            className="absolute top-[22%] left-[52%] z-30 w-4 h-4 rounded-full bg-cyan-400/80 border border-white animate-pulse shadow-[0_0_12px_#06b6d4]"
          />

          <button
            title="Umbilical Cord & Oxygen Supply"
            onClick={(e) => {
              e.stopPropagation();
              setActiveHotspot(activeHotspot === 'cord' ? null : 'cord');
            }}
            className="absolute top-[60%] left-[32%] z-30 w-4 h-4 rounded-full bg-pink-400/80 border border-white animate-pulse shadow-[0_0_12px_#ec4899]"
          />
        </div>
      </div>

      {/* Interactive Tooltip Card Overlay for Hotspots */}
      {activeHotspot && (
        <div className="absolute top-4 z-40 bg-slate-900/90 border border-teal-500/40 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs text-slate-200 shadow-xl max-w-[240px] text-center animate-fade-in">
          {activeHotspot === 'heart' && '❤️ Fetal Heartbeat: Rates average 120–160 BPM.'}
          {activeHotspot === 'brain' && '🧠 Brain & Nervous System: Millions of neural connections forming.'}
          {activeHotspot === 'cord' && '🩸 Umbilical Cord: Delivering vital oxygen & nutrient flow.'}
        </div>
      )}

      {/* Week & Comparison Footer Controls */}
      <div className="relative z-20 mt-4 flex flex-col items-center space-y-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="w-7 h-7 rounded-full bg-slate-800/80 border border-slate-700 text-teal-400 flex items-center justify-center hover:bg-slate-700 transition-all text-sm"
            title="Previous Week"
          >
            ‹
          </button>

          <div className="px-4 py-1 rounded-full bg-teal-950/60 border border-teal-500/30 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
              Week {weekData.week}
            </span>
          </div>

          <button
            onClick={onNext}
            className="w-7 h-7 rounded-full bg-slate-800/80 border border-slate-700 text-teal-400 flex items-center justify-center hover:bg-slate-700 transition-all text-sm"
            title="Next Week"
          >
            ›
          </button>
        </div>

        <p className="text-sm font-display font-semibold text-slate-200 mt-1">
          Size of <span className="text-teal-300">{weekData.sizeComparison}</span>
        </p>

        <p className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1">
          <span>✨ Drag or move cursor for 3D tilt</span> · <span>Tap glowing dots for organ info</span>
        </p>
      </div>
    </div>
  );
}
