import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function AuthPage() {
  const { loginWithEmail, signupWithEmail, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="max-w-sm mx-auto space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">{mode === 'login' ? 'Log in' : 'Create account'}</h1>
        <p className="text-sm text-clinical-muted mt-1">
          {user.isGuest ? 'You\'re currently using guest mode — emergency triage works without an account. Sign in only if you want your history saved across devices.' : 'You are signed in.'}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-clinical-panel2 border border-clinical-border rounded-md p-2.5 text-sm" />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-clinical-panel2 border border-clinical-border rounded-md p-2.5 text-sm" />
        {error && <p className="text-xs text-severity-URGENT">{error}</p>}
        <button type="submit" className="w-full px-4 py-2.5 rounded-md bg-clinical-accent text-clinical-bg font-medium text-sm">
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>

      <button onClick={loginWithGoogle} className="w-full px-4 py-2.5 rounded-md bg-clinical-panel2 border border-clinical-border text-sm">
        Continue with Google
      </button>

      <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-xs text-clinical-muted underline underline-offset-2">
        {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
      </button>
    </div>
  );
}
