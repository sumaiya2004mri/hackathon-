import { useState, useEffect } from 'react';

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_SLIDES = [
  {
    id: 1,
    title: 'Welcome to Emergency AI',
    subtitle: 'Women\'s Health & Instant Medical Triage',
    description: 'Designed for high-contrast, offline-first emergency guidance and maternal care across Bangladesh.',
    badge: 'Overview',
    bgGradient: 'from-pink-500 via-rose-500 to-pink-600',
    content: (
      <div className="flex flex-col items-center justify-center space-y-3 py-4 text-white text-center">
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md p-3 border border-white/40 shadow-xl animate-pulse">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
        </div>
        <p className="text-sm opacity-90 max-w-xs">
          Empowering emergency decisions with instant local rule evaluation, voice readout, and maternal health tracking.
        </p>
      </div>
    ),
  },
  {
    id: 2,
    title: 'Instant Symptom Assessment',
    subtitle: 'Local Rule Engine + Gemini Vision Analysis',
    description: 'Describe symptoms or upload photo labels to get clinical urgency recommendations in seconds.',
    badge: 'Triage',
    bgGradient: 'from-rose-600 via-pink-600 to-rose-700',
    content: (
      <div className="bg-slate-900/90 border border-pink-500/40 rounded-2xl p-4 space-y-2 text-left text-xs shadow-xl backdrop-blur-md max-w-xs mx-auto">
        <div className="flex items-center justify-between text-emerald-400 font-semibold">
          <span>Symptom Check: Active</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <p className="text-slate-300 font-mono">"Heavy bleeding during week 14"</p>
        <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300">
          <span className="font-bold">🚨 Emergency Level:</span> Seek immediate emergency obstetric care now.
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: '3D Glass Fetal Visualizer',
    subtitle: 'Interactive Amniotic Sac & Milestones',
    description: 'Explore week-by-week fetal growth with 3D glass perspective tilt, organ hotspots, and heartbeat pulse.',
    badge: 'Pregnancy',
    bgGradient: 'from-teal-600 via-emerald-600 to-teal-700',
    content: (
      <div className="relative flex flex-col items-center justify-center p-3">
        <div className="w-28 h-36 rounded-full overflow-hidden border border-teal-300/40 shadow-[0_0_30px_rgba(13,148,136,0.5)] backdrop-blur-md bg-slate-950/80">
          <img src="/glass_fetal_embryo_3d.jpg" alt="Fetus" className="w-full h-full object-cover rounded-full mix-blend-screen opacity-90 animate-pulse" />
        </div>
        <span className="mt-2 text-xs font-semibold text-teal-200">✨ Week 20 · 3D Glass Sac</span>
      </div>
    ),
  },
  {
    id: 4,
    title: 'Period & Cycle Health',
    subtitle: 'Predictive Analytics & Symptom Logs',
    description: 'Track cycle lengths, flow intensity, mood variations, and fertile windows automatically.',
    badge: 'Period',
    bgGradient: 'from-pink-600 via-rose-600 to-pink-700',
    content: (
      <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-4 text-center text-xs space-y-2 max-w-xs mx-auto">
        <div className="flex items-center justify-around font-semibold text-pink-200">
          <div>Avg Cycle: <span className="text-white font-bold">28 Days</span></div>
          <div>Next Start: <span className="text-white font-bold">In 5 Days</span></div>
        </div>
        <div className="flex justify-center gap-1.5 pt-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
            <span key={d} className={`px-2 py-1 rounded-lg text-[10px] ${i >= 2 && i <= 5 ? 'bg-pink-500 text-white font-bold' : 'bg-white/10 text-pink-200'}`}>{d}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: 'Nearest Emergency Care & Map',
    subtitle: 'Turn-by-Turn Navigation & Contacts',
    description: 'Locate nearby medical centers with interactive map routes, Google Maps navigation, and 999 hotline.',
    badge: 'Hospital Map',
    bgGradient: 'from-slate-900 via-rose-950 to-slate-950',
    content: (
      <div className="bg-slate-900/90 border border-white/20 rounded-2xl p-3 text-xs space-y-2 text-left max-w-xs mx-auto shadow-xl">
        <div className="flex items-center justify-between font-semibold text-rose-400">
          <span>🏥 Rajshahi Medical College Hospital</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300">0.5 km</span>
        </div>
        <div className="flex gap-2 pt-1">
          <span className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-semibold">🧭 Google Maps</span>
          <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-200 text-[10px]">📞 0721-772150</span>
        </div>
      </div>
    ),
  },
];

export default function TourModal({ isOpen, onClose }: TourModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setCurrentSlide((s) => (s + 1) % TOUR_SLIDES.length);
            return 0;
          }
          return prev + 2; // 50 ticks = 100% per 6 sec slide (30s total)
        });
      }, 120);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  const slide = TOUR_SLIDES[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-950 border border-pink-500/30 rounded-3xl overflow-hidden shadow-2xl space-y-0 text-white">
        {/* Progress Header Bar */}
        <div className="p-4 pb-2 bg-gradient-to-b from-slate-900 to-transparent space-y-2">
          <div className="flex items-center justify-between text-xs text-pink-300 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              <span>30-Second Guided Tour</span>
            </span>
            <span>{currentSlide + 1} / {TOUR_SLIDES.length}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-150"
              style={{
                width: `${((currentSlide * 20) + (progress / 5))}%`,
              }}
            />
          </div>
        </div>

        {/* Slide Body */}
        <div className={`p-6 bg-gradient-to-br ${slide.bgGradient} min-h-[340px] flex flex-col justify-between transition-all duration-500 relative overflow-hidden`}>
          <div className="space-y-1 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {slide.badge}
            </span>
            <h3 className="text-xl font-display font-bold text-white pt-1">{slide.title}</h3>
            <p className="text-xs text-white/80 font-medium">{slide.subtitle}</p>
          </div>

          {/* Slide Content Visual */}
          <div className="my-2">{slide.content}</div>

          <p className="text-xs text-white/90 text-center leading-relaxed font-light px-2">
            {slide.description}
          </p>
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-slate-900 flex items-center justify-between gap-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentSlide((s) => (s - 1 + TOUR_SLIDES.length) % TOUR_SLIDES.length);
                setProgress(0);
              }}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-pink-400 flex items-center justify-center font-bold text-sm"
              title="Previous"
            >
              ‹
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>

            <button
              onClick={() => {
                setCurrentSlide((s) => (s + 1) % TOUR_SLIDES.length);
                setProgress(0);
              }}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-pink-400 flex items-center justify-center font-bold text-sm"
              title="Next"
            >
              ›
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
          >
            Close Tour
          </button>
        </div>
      </div>
    </div>
  );
}
