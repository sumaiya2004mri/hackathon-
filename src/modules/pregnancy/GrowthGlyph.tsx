import { useState, useEffect } from 'react';
import type { WeekData } from './fetalGrowthData';
import { useLanguage } from '../../context/LanguageContext';

interface GrowthGlyphProps {
  weekData: WeekData;
  onNext: () => void;
  onPrev: () => void;
}

const EDUCATIONAL_LABELS: Record<'en' | 'bn', string[]> = {
  en: [
    "Baby's development",
    "Growing week by week",
    "Organs continue developing",
    "Baby begins to move",
    "Your baby's growth journey",
  ],
  bn: [
    "সন্তানের শারীরিক বিকাশ",
    "প্রতি সপ্তাহে একটু একটু বৃদ্ধি",
    "প্রধান অঙ্গের বিকাশ চলছে",
    "ভ্রূণের সূক্ষ্ম নড়াচড়া",
    "সন্তানের বৃদ্ধির সুন্দর যাত্রা",
  ],
};

export default function GrowthGlyph({ weekData, onNext, onPrev }: GrowthGlyphProps) {
  const { lang } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(true);
  const [labelIndex, setLabelIndex] = useState(0);
  const [loopProgress, setLoopProgress] = useState(0);

  const labels = EDUCATIONAL_LABELS[lang] ?? EDUCATIONAL_LABELS.en;

  // 30-second looping animation
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setLoopProgress((prev) => {
          if (prev >= 100) {
            setLabelIndex((idx) => (idx + 1) % labels.length);
            return 0;
          }
          return prev + 1; // 100 steps * 300ms = 30s total loop
        });
      }, 300);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, labels.length]);

  const scaleRatio = (weekData.week - 4) / (40 - 4);
  const wombScale = 0.9 + scaleRatio * 0.15;
  const fetusRadius = 10 + scaleRatio * 32;
  const currentLabel = labels[labelIndex % labels.length];

  return (
    <div className="relative select-none flex flex-col items-center justify-between p-6 bg-gradient-to-br from-pink-50/90 via-white to-rose-50/80 rounded-3xl border border-pink-200/80 shadow-sm min-h-[380px] overflow-hidden group font-body">
      {/* Subtle Background Glow Elements */}
      <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-pink-200/30 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full bg-rose-200/30 blur-2xl pointer-events-none" />

      {/* Top Educational Tag & 30-Second Loop Progress */}
      <div className="w-full flex flex-col items-center space-y-2.5 z-10">
        <div className="flex items-center justify-between w-full text-xs md:text-sm">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-pink-200 text-[#E85A91] font-bold shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E85A91] animate-ping" />
            <span>{currentLabel}</span>
          </span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-xs px-3 py-1 rounded-full bg-white border border-pink-200 text-slate-700 hover:text-[#E85A91] transition-colors font-bold shadow-2xs"
          >
            {isPlaying ? (lang === 'bn' ? '⏸️ থামান' : '⏸️ Pause 30s Loop') : (lang === 'bn' ? '▶️ চালান' : '▶️ Play 30s Loop')}
          </button>
        </div>

        {/* 30-second progress bar */}
        <div className="w-full h-1.5 bg-pink-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-[#E85A91] transition-all duration-300"
            style={{ width: `${loopProgress}%` }}
          />
        </div>
      </div>

      {/* Educational Womb & Fetal Growth Visualizer */}
      <div className="relative my-4 z-10 flex flex-col items-center justify-center cursor-pointer">
        <svg
          className="w-60 h-60 transition-transform duration-700 ease-out"
          style={{ transform: `scale(${wombScale})` }}
          viewBox="0 0 200 200"
        >
          <defs>
            <radialGradient id="wombFluid" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F7D7E4" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#FFF5F8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FCE7F3" stopOpacity="0.1" />
            </radialGradient>

            <radialGradient id="fetusGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E85A91" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#F7D7E4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#E85A91" stopOpacity="0" />
            </radialGradient>
          </defs>

          <path
            d="M 100,20 C 145,20 175,55 175,100 C 175,145 145,180 100,180 C 55,180 25,145 25,100 C 25,55 55,20 100,20 Z"
            fill="url(#wombFluid)"
            stroke="#F7D7E4"
            strokeWidth="3"
            strokeDasharray="6 6"
          />

          <path
            d="M 100,28 C 138,28 165,60 165,100 C 165,140 138,172 100,172 C 62,172 35,140 35,100 C 35,60 62,28 100,28 Z"
            fill="none"
            stroke="#E85A91"
            strokeWidth="2"
            strokeOpacity="0.25"
          />

          <path
            d={`M 140,80 Q ${120 + scaleRatio * 10},${100 - scaleRatio * 5} 100,100`}
            fill="none"
            stroke="#E85A91"
            strokeWidth="2"
            strokeOpacity="0.4"
            strokeDasharray="3 3"
          />

          <path
            d="M 130,50 Q 155,80 145,120"
            fill="none"
            stroke="#E85A91"
            strokeWidth="4"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />

          <circle
            cx="100"
            cy="100"
            r={fetusRadius}
            fill="url(#fetusGlow)"
            className="transition-all duration-700 ease-out"
          />

          <circle
            cx="100"
            cy="100"
            r={Math.max(3, fetusRadius * 0.35)}
            fill="#E85A91"
            className="animate-pulse transition-all duration-700"
          />
        </svg>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-2 h-2 rounded-full bg-pink-300/60 animate-bounce top-1/3 left-1/3" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-rose-400/50 animate-pulse bottom-1/3 right-1/3" />
        </div>
      </div>

      {/* Week Navigation & Comparison Footer */}
      <div className="w-full flex items-center justify-between z-10 pt-3 border-t border-pink-100">
        <button
          onClick={onPrev}
          className="w-9 h-9 rounded-full bg-white border border-pink-200 text-[#E85A91] flex items-center justify-center hover:bg-pink-50 transition-colors font-extrabold text-base shadow-2xs"
          title="Previous Week"
        >
          ‹
        </button>

        <div className="text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {lang === 'bn' ? `সপ্তাহ ${weekData.week}` : `Week ${weekData.week}`}
          </p>
          <p className="text-sm md:text-base font-display font-bold text-slate-900">
            {lang === 'bn' ? 'আকার প্রায় ' : 'About the size of '}
            <span className="text-[#E85A91] font-extrabold">{weekData.sizeComparison}</span>
          </p>
        </div>

        <button
          onClick={onNext}
          className="w-9 h-9 rounded-full bg-white border border-pink-200 text-[#E85A91] flex items-center justify-center hover:bg-pink-50 transition-colors font-extrabold text-base shadow-2xs"
          title="Next Week"
        >
          ›
        </button>
      </div>
    </div>
  );
}
