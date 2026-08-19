import { Routes, Route, NavLink } from 'react-router-dom';
import CriticalBanner from './components/CriticalBanner';
import GeneralTriagePage from './modules/general/GeneralTriagePage';
import PregnancyModule from './modules/pregnancy/PregnancyModule';
import PeriodModule from './modules/period/PeriodModule';
import FemaleHealthModule from './modules/femaleHealth/FemaleHealthModule';
import Dashboard from './dashboard/Dashboard';
import SettingsPage from './dashboard/SettingsPage';
import AuthPage from './auth/AuthPage';
import { useAuth } from './auth/AuthContext';

const NAV = [
  { to: '/', label: 'Triage', icon: '🚨', end: true },
  { to: '/pregnancy', label: 'Pregnancy', icon: '🤰' },
  { to: '/period', label: 'Period', icon: '🌸' },
  { to: '/female-health', label: 'Female Health', icon: '🏥' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
];

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-maternal-blush/60 text-maternal-text font-body pb-16 md:pb-0">
      {/* Top Subtle Emergency Alert Banner */}
      <CriticalBanner />

      {/* Elegant Header Navigation Bar */}
      <header className="border-b border-maternal-border/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Logo & Brand Title */}
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-full bg-pink-100/90 border border-pink-200 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-all">
              <img src="/logo.png" alt="Emergency AI Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base text-maternal-text leading-tight group-hover:text-maternal-primary transition-colors">
                Emergency AI
              </span>
              <span className="text-[10px] text-maternal-primary font-bold tracking-wider uppercase">Maternal & Health</span>
            </div>
          </NavLink>

          {/* Desktop Pill Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1.5 bg-maternal-blush/80 p-1 rounded-full border border-maternal-border">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                    isActive
                      ? 'bg-maternal-primary text-white shadow-sm font-semibold'
                      : 'text-maternal-muted hover:text-maternal-text hover:bg-white/60'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <NavLink to="/settings" className="text-xs text-maternal-muted hover:text-maternal-primary px-2.5 py-1 font-medium transition-colors">
              Settings
            </NavLink>

            {user.isGuest ? (
              <NavLink
                to="/auth"
                className="text-xs px-3.5 py-1.5 rounded-full bg-white border border-maternal-border text-maternal-primary font-semibold hover:bg-maternal-blush transition-all shadow-xs"
              >
                Log in
              </NavLink>
            ) : (
              <span className="text-xs text-maternal-primary font-semibold font-mono px-3 py-1 bg-white rounded-full border border-maternal-border shadow-xs">
                {user.name ?? 'Signed in'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Area */}
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

      {/* Floating Bottom Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-maternal-border px-2 py-1.5 flex items-center justify-around shadow-lg">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
                isActive ? 'text-maternal-primary font-bold scale-105' : 'text-maternal-muted hover:text-maternal-text'
              }`
            }
          >
            <span className="text-base">{n.icon}</span>
            <span className="text-[10px] font-medium">{n.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <footer className="border-t border-maternal-border py-4 text-center text-xs text-maternal-muted bg-white/40">
        Emergency AI is informational support, not a substitute for professional medical diagnosis or emergency services.
      </footer>
    </div>
  );
}
