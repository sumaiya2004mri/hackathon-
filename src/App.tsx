import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import CriticalBanner from './components/CriticalBanner';
import GeneralTriagePage from './modules/general/GeneralTriagePage';
import PregnancyModule from './modules/pregnancy/PregnancyModule';
import PeriodModule from './modules/period/PeriodModule';
import FemaleHealthModule from './modules/femaleHealth/FemaleHealthModule';
import Dashboard from './dashboard/Dashboard';
import SettingsPage from './dashboard/SettingsPage';
import AuthPage from './auth/AuthPage';
import { useAuth } from './auth/AuthContext';

// Module color-coding (spec item 1): each nav item carries the accent color
// of the module it leads to. Coral is reserved for Triage since that's the
// urgent/attention-state module; everything else uses its own module color;
// neutral items (Dashboard/Settings) use the neutral tone.
const NAV = [
  { to: '/', label: 'Triage', end: true, accent: 'emergency' as const },
  { to: '/pregnancy', label: 'Pregnancy', accent: 'pregnancy' as const },
  { to: '/period', label: 'Period', accent: 'period' as const },
  { to: '/female-health', label: 'Female health', accent: 'neutral' as const },
  { to: '/dashboard', label: 'Dashboard', accent: 'neutral' as const },
];

const ACCENT_ACTIVE_CLASSES: Record<string, string> = {
  pregnancy: 'bg-module-pregnancyBg text-module-pregnancy',
  period: 'bg-module-periodBg text-module-period',
  emergency: 'bg-module-emergencyBg text-module-emergency',
  neutral: 'bg-module-neutralBg text-ink',
};

export default function App() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* CriticalBanner is mounted here, above the router outlet, so it is
          guaranteed visible on every route and never gated by module state. */}
      <CriticalBanner />

      <header className="border-b border-cream-border bg-cream-card/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <span className="font-display font-semibold text-lg text-ink">Emergency AI</span>
          <nav className="flex gap-1 overflow-x-auto">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => `press text-sm px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${isActive ? ACCENT_ACTIVE_CLASSES[n.accent] : 'text-ink-muted hover:text-ink'}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/settings" className="press text-xs text-ink-muted hover:text-ink">Settings</NavLink>
            {user.isGuest ? (
              <NavLink to="/auth" className="press text-xs px-3 py-1.5 rounded-full bg-module-neutralBg text-ink border border-cream-border">Log in</NavLink>
            ) : (
              <span className="text-xs font-medium text-module-pregnancy">{user.name ?? 'Signed in'}</span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<GeneralTriagePage />} />
          <Route path="/pregnancy" element={<PregnancyModule />} />
          <Route path="/period" element={<PeriodModule />} />
          <Route path="/female-health" element={<FemaleHealthModule />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>

      <footer className="border-t border-cream-border py-4 text-center text-xs text-ink-soft">
        Emergency AI is informational support, not a substitute for professional medical diagnosis or emergency services.
      </footer>
    </div>
  );
}
