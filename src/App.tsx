import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import CriticalBanner from './components/CriticalBanner';
import HomePage from './pages/HomePage';
import GeneralTriagePage from './modules/general/GeneralTriagePage';
import PregnancyModule from './modules/pregnancy/PregnancyModule';
import PeriodModule from './modules/period/PeriodModule';
import FemaleHealthModule from './modules/femaleHealth/FemaleHealthModule';
import Dashboard from './dashboard/Dashboard';
import SettingsPage from './dashboard/SettingsPage';
import AuthPage from './auth/AuthPage';
import EmergencyContactModal from './components/EmergencyContactModal';
import { useAuth } from './auth/AuthContext';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { user } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const NAV = [
    { to: '/', label: lang === 'bn' ? 'হোম' : 'Home', icon: '🏠', end: true },
    { to: '/triage', label: t('triage'), icon: '🚨' },
    { to: '/pregnancy', label: t('pregnancy'), icon: '🤰' },
    { to: '/period', label: t('period'), icon: '🌸' },
    { to: '/female-health', label: t('femaleHealth'), icon: '🏥' },
    { to: '/dashboard', label: t('dashboard'), icon: '📊' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5F8] text-slate-900 font-body pb-16 md:pb-0">
      {/* Top Emergency Alert Strip */}
      <CriticalBanner />

      {/* Header Navigation Bar */}
      <header className="border-b border-pink-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2.5">
          {/* Logo & Brand Title: Quick_care */}
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-full bg-pink-100 border border-pink-300 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-all">
              <img src="/logo.png" alt="Quick_care Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="app-title font-heading text-lg font-bold text-slate-900 leading-tight group-hover:text-[#E85A91] transition-colors tracking-wide">
                Quick_care
              </span>
              <span className="text-[10px] text-[#E85A91] font-subheading font-bold tracking-wider uppercase">
                {lang === 'bn' ? 'যে সেবা সবার আগে আপনার কাছে পৌঁছায়' : 'Care that reaches you first.'}
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1.5 bg-pink-50/90 p-1.5 rounded-full border border-pink-200">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap font-subheading font-bold transition-all ${
                    isActive
                      ? 'bg-[#E85A91] text-white shadow-md'
                      : 'text-slate-900 hover:text-[#E85A91] hover:bg-white/80'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Header Action Controls */}
          <div className="flex items-center gap-2">
            {/* Language Switcher Button (English / Bangla) */}
            <button
              onClick={toggleLang}
              className="text-xs px-3 py-1.5 rounded-full bg-pink-50 border border-pink-300 text-[#E85A91] font-bold hover:bg-pink-100 transition-all flex items-center gap-1 shadow-2xs"
              title="Toggle Language / ভাষা পরিবর্তন করুন"
            >
              <span>🌐</span>
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Emergency Contact Quick Button */}
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="text-xs px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 transition-all flex items-center gap-1"
              title="Mandatory Emergency Contact"
            >
              <span>🚨</span>
              <span className="hidden sm:inline font-mono">
                {user.emergencyContact?.phone ? user.emergencyContact.phone : t('emergencyContact')}
              </span>
            </button>

            <NavLink to="/settings" className="text-xs text-slate-900 hover:text-[#E85A91] px-2 py-1 font-bold transition-colors">
              {t('settings')}
            </NavLink>

            {user.isGuest ? (
              <NavLink
                to="/auth"
                className="text-xs px-3.5 py-1.5 rounded-full bg-[#E85A91] text-white font-bold hover:bg-[#D4437B] transition-all shadow-xs"
              >
                {t('login')}
              </NavLink>
            ) : (
              <span className="text-xs text-[#E85A91] font-bold font-mono px-3 py-1 bg-pink-50 rounded-full border border-pink-200 shadow-xs">
                {user.name ?? t('signedIn')}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/triage" element={<GeneralTriagePage />} />
          <Route path="/pregnancy" element={<PregnancyModule />} />
          <Route path="/period" element={<PeriodModule />} />
          <Route path="/female-health" element={<FemaleHealthModule />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>

      {/* Floating Bottom Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-pink-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive ? 'bg-[#E85A91] text-white font-bold scale-105 shadow-xs' : 'text-slate-900 hover:text-[#E85A91] font-bold'
              }`
            }
          >
            <span className="text-base">{n.icon}</span>
            <span className="text-[10px] font-bold">{n.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <footer className="border-t border-pink-200 py-4 text-center text-xs text-slate-700 font-medium bg-white/60">
        Quick_care — Care that reaches you first. Informational support, not a substitute for professional medical diagnosis.
      </footer>

      {/* Mandatory Emergency Contact Modal */}
      <EmergencyContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}
