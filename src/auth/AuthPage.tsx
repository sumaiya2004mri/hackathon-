import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function AuthPage() {
  const { loginWithEmail, signupWithEmail, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') await loginWithEmail(email, password);
      else await signupWithEmail(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
    }
  }

  return (
    <div className="max-w-sm mx-auto space-y-6 animate-fade-in py-4">
      {/* Brand Logo & Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-pink-100/80 border border-pink-200 p-2 shadow-sm flex items-center justify-center">
          <img src="/logo.png" alt="Emergency AI Logo" className="w-full h-full object-contain rounded-full" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-clinical-text">
          {mode === 'login' ? 'Log in to Emergency AI' : 'Create an Account'}
        </h1>
        <p className="text-xs text-clinical-muted leading-relaxed">
          {user.isGuest
            ? 'Emergency triage works instantly without login. Sign in to sync period, pregnancy & health logs across devices.'
            : 'You are currently signed in.'}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4 card p-5 border border-clinical-border shadow-sm bg-white/70">
        <div>
          <label className="text-xs font-semibold text-clinical-muted block mb-1">Email address</label>
          <input
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-clinical-panel2 border border-clinical-border rounded-xl p-2.5 text-sm focus:outline-none focus:border-pink-500 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-clinical-muted block mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-clinical-panel2 border border-clinical-border rounded-xl p-2.5 pr-10 text-sm focus:outline-none focus:border-pink-500 transition-all"
            />
            {/* Password Visibility Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-clinical-muted hover:text-clinical-text transition-all text-base focus:outline-none"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-severity-URGENT font-medium">{error}</p>}

        <button
          type="submit"
          className="w-full px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-medium text-sm transition-all shadow-sm"
        >
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </button>

        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full px-4 py-2.5 rounded-xl bg-clinical-panel2 border border-clinical-border text-sm font-medium hover:bg-clinical-panel transition-all flex items-center justify-center gap-2"
        >
          <span>🌐</span>
          <span>Continue with Google</span>
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-xs text-pink-600 font-semibold underline underline-offset-2 hover:text-pink-700 transition-all"
        >
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}
