import { useState, useEffect } from 'react';

interface FetalAnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FETAL_STAGES = [
  { week: 4, label: 'Week 4: Blastocyst & Sac', desc: 'Heart begins rhythmically beating. Tiny amniotic sac forms.', color: '#f43f5e' },
  { week: 8, label: 'Week 8: Embryo Formation', desc: 'Arms, fingers, and facial features developing rapidly.', color: '#e11d48' },
  { week: 16, label: 'Week 16: Active Movement', desc: 'Fetus kicks, swallows amniotic fluid, and responds to sound.', color: '#be123c' },
  { week: 28, label: 'Week 28: Brain & Eye Reflexes', desc: 'Eyes open and close; rapid neural pathways building.', color: '#9f1239' },
  { week: 40, label: 'Week 40: Full Term', desc: 'Ready for birth! Fully developed organ systems and weight.', color: '#881337' },
];

export default function TourModal({ isOpen, onClose }: FetalAnimationModalProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setCurrentStage((s) => (s + 1) % FETAL_STAGES.length);
            return 0;
          }
          return prev + 2; // 50 ticks * 120ms = 6s per stage (30s total)
        });
      }, 120);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  const stage = FETAL_STAGES[currentStage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-950 border border-rose-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-0 text-white">
        {/* Progress Header Bar */}
        <div className="p-4 pb-2 bg-gradient-to-b from-slate-900 to-transparent space-y-2">
          <div className="flex items-center justify-between text-xs text-rose-300 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>30-Second Fetal Life Simulation</span>
            </span>
            <span>{currentStage + 1} / {FETAL_STAGES.length}</span>
          </div>

          {/* 30-Second Overall Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-150"
              style={{
                width: `${((currentStage * 20) + (progress / 5))}%`,
              }}
            />
          </div>
        </div>

        {/* 3D Glass Fetal Amniotic Sac Video Simulation Container */}
        <div className="p-6 bg-gradient-to-b from-slate-950 via-rose-950/40 to-slate-950 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative w-48 h-60 rounded-full overflow-hidden border border-white/20 shadow-[0_0_60px_rgba(225,29,72,0.45)] backdrop-blur-md bg-slate-900 flex items-center justify-center">
            {/* Amniotic fluid animated glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-rose-400/20 pointer-events-none z-10" />
            
            {/* Glowing Heartbeat Ring */}
            <div className="absolute w-36 h-48 rounded-full border border-rose-400/50 animate-ping opacity-40" />

            {/* 3D Glass Fetal Image */}
            <img
              src="/glass_fetal_embryo_3d.jpg"
              alt="Fetal Life Animation"
              className="w-full h-full object-cover rounded-full mix-blend-screen opacity-90 transition-transform duration-700 animate-pulse"
              style={{
                transform: `scale(${0.8 + (currentStage * 0.08)})`,
              }}
            />
          </div>

          {/* Stage Description */}
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
              {stage.label}
            </span>
            <p className="text-xs text-slate-300 pt-2 leading-relaxed max-w-xs font-light">
              {stage.desc}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="p-4 bg-slate-900 flex items-center justify-between gap-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentStage((s) => (s - 1 + FETAL_STAGES.length) % FETAL_STAGES.length);
                setProgress(0);
              }}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-rose-400 flex items-center justify-center font-bold text-sm"
              title="Previous Stage"
            >
              ‹
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>

            <button
              onClick={() => {
                setCurrentStage((s) => (s + 1) % FETAL_STAGES.length);
                setProgress(0);
              }}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-rose-400 flex items-center justify-center font-bold text-sm"
              title="Next Stage"
            >
              ›
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
          >
            Close Animation
          </button>
        </div>
      </div>
    </div>
  );
}
