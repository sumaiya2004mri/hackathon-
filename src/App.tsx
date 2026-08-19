import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import CriticalBanner from './components/CriticalBanner';
import GeneralTriagePage from './modules/general/GeneralTriagePage';
import PregnancyModule from './modules/pregnancy/PregnancyModule';
import PeriodModule from './modules/period/PeriodModule';
import FemaleHealthModule from './modules/femaleHealth/FemaleHealthModule';
import Dashboard from './dashboard/Dashboard';
import SettingsPage from './dashboard/SettingsPage';
import AuthPage from './auth/AuthPage';
import TourModal from './components/TourModal';
import { useAuth } from './auth/AuthContext';

const NAV = [
  { to: '/', label: 'Triage', icon: '🚨', end: true },
  { to: '/pregnancy', label: 'Pregnancy', icon: '🤰' },
  { to: '/period', label: 'Period', icon: '🌸' },
  { to: '/female-health', label: 'Female health', icon: '🏥' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
];

export default function App() {
  const { user } = useAuth();
  const [isTourOpen, setIsTourOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <CriticalBanner />

      {/* Header Navigation Bar */}
      <header className="border-b border-clinical-border bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Logo & Brand Name */}
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-full bg-pink-100/80 border border-pink-200 p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-all">
              <img src="/logo.png" alt="Emergency AI Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base text-clinical-text leading-tight group-hover:text-pink-600 transition-colors">
                Emergency AI
              </span>
              <span className="text-[10px] text-pink-600 font-semibold tracking-wider uppercase">Maternal & Health</span>
            </div>
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `text-sm px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                    isActive
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'text-clinical-muted hover:text-clinical-text hover:bg-pink-50'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* 30s Guided Tour Button */}
            <button
              onClick={() => setIsTourOpen(true)}
              className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium shadow-sm hover:opacity-95 transition-all flex items-center gap-1 animate-pulse"
            >
              <span>✨ 30s Fetal Animation</span>
            </button>

            <NavLink to="/settings" className="text-xs text-clinical-muted hover:text-clinical-text px-2 py-1">
              Settings
            </NavLink>

            {user.isGuest ? (
              <NavLink
                to="/auth"
                className="text-xs px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 font-semibold hover:bg-pink-100 transition-all"
              >
                Log in
              </NavLink>
            ) : (
              <span className="text-xs text-pink-600 font-medium font-mono px-2 py-1 bg-pink-50 rounded-full border border-pink-100">
                {user.name ?? 'Signed in'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<GeneralTriagePage />} />
          <Route path="/pregnancy" element={<PregnancyModule />} />
          <Route path="/period" element={<PeriodModule />} />
          <Route path="/female-health" element={<FemaleHealthModule />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>

      {/* Floating Bottom Mobile Navigation Bar (Matching Picture 1 layout) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-pink-100 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
                isActive ? 'text-pink-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <span className="text-base">{n.icon}</span>
            <span className="text-[10px] font-medium">{n.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <footer className="border-t border-clinical-border py-4 text-center text-xs text-clinical-muted">
        Emergency AI is informational support, not a substitute for professional medical diagnosis or emergency services.
      </footer>

      {/* 30-Second Guided Tour Modal */}
      <TourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
}
