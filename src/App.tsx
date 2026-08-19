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
  { to: '/', label: 'Triage', end: true },
  { to: '/pregnancy', label: 'Pregnancy' },
  { to: '/period', label: 'Period' },
  { to: '/female-health', label: 'Female health' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* CriticalBanner is mounted here, above the router outlet, so it is
          guaranteed visible on every route and never gated by module state. */}
      <CriticalBanner />

      <header className="border-b border-clinical-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <span className="font-display font-semibold">Emergency AI</span>
          <nav className="flex gap-1 overflow-x-auto">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => `text-sm px-3 py-1.5 rounded-md whitespace-nowrap ${isActive ? 'bg-clinical-accent/15 text-clinical-accent' : 'text-clinical-muted hover:text-clinical-text'}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/settings" className="text-xs text-clinical-muted hover:text-clinical-text">Settings</NavLink>
            {user.isGuest ? (
              <NavLink to="/auth" className="text-xs px-3 py-1.5 rounded-md bg-clinical-panel2 border border-clinical-border">Log in</NavLink>
            ) : (
              <span className="text-xs text-clinical-teal">{user.name ?? 'Signed in'}</span>
            )}
          </div>
        </div>
      </header>

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

      <footer className="border-t border-clinical-border py-4 text-center text-xs text-clinical-muted">
        Emergency AI is informational support, not a substitute for professional medical diagnosis or emergency services.
      </footer>
    </div>
  );
}
