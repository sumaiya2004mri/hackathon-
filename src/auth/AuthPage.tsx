import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AuthPage() {
  const { loginWithEmail, signupWithEmail, loginWithGoogle, updateProfile, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
        if (medicalHistory) {
          updateProfile({ medicalHistoryText: medicalHistory });
        }
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
    }
  }

  return (
    <div className="max-w-sm mx-auto space-y-6 animate-fade-in py-4 font-body">
      {/* Brand Logo & Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-pink-100/80 border border-pink-200 p-2 shadow-sm flex items-center justify-center">
          <img src="/logo.png" alt="Emergency AI Logo" className="w-full h-full object-contain rounded-full" />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">
          {mode === 'login' ? 'Log in to Emergency AI' : 'Create an Account'}
        </h1>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          {user.isGuest
            ? 'Emergency triage works instantly without login. Sign in to sync period, pregnancy & health records.'
            : 'You are currently signed in.'}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4 p-6 border border-pink-200 rounded-3xl shadow-sm bg-white">
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-1">Email Address</label>
          <input
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-pink-50/60 border border-pink-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#E85A91] transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-900 block mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-pink-50/60 border border-pink-200 rounded-xl p-3 pr-10 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#E85A91] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 text-base focus:outline-none"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>
        </div>

        {/* Medical History Input (Shown during Signup) */}
        {mode === 'signup' && (
          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-[#E85A91] flex items-center gap-1">
              <span>🩺 Medical History / Background</span>
              <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="E.g. High Blood Pressure, Asthma, Gestational Diabetes, Allergies, Previous C-Section..."
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              className="w-full bg-pink-50/60 border border-pink-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#E85A91] transition-all resize-none"
            />
            <p className="text-[10px] text-slate-500">
              * Automatically printed under "B — Background" on SBAR PDF reports and used for AI risk checks.
            </p>
          </div>
        )}

        {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}

        <button
          type="submit"
          className="w-full px-4 py-3 rounded-full bg-[#E85A91] hover:bg-[#D4437B] text-white font-bold text-xs transition-all shadow-sm"
        >
          {mode === 'login' ? 'Log in' : 'Create Account & Save Profile'}
        </button>

        <button
          type="button"
          onClick={async () => {
            await loginWithGoogle();
            navigate('/dashboard');
          }}
          className="w-full px-4 py-2.5 rounded-full bg-pink-50 border border-pink-200 text-slate-900 text-xs font-bold hover:bg-pink-100 transition-all flex items-center justify-center gap-2"
        >
          <span>🌐</span>
          <span>Continue with Google</span>
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-xs text-[#E85A91] font-bold underline underline-offset-2 hover:text-[#D4437B] transition-all"
        >
          {mode === 'login' ? 'Need an account? Sign up with Medical History' : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}
