import { useState } from "react";
import { Activity, AlertCircle, Loader2, Lock, Mail, User } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

export function AuthScreen() {
  const { signup, login, configured } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-amber-600" />
          <h2 className="mb-2 text-lg font-bold text-amber-900">
            Accounts aren't configured yet
          </h2>
          <p className="text-sm text-amber-800">
            Firebase environment variables are missing. Add your Firebase
            project config as environment variables (see the README/.env.example)
            and redeploy to enable accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm">
            <Activity className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-bold text-blue-900">Emergency AI</h1>
          <p className="text-sm text-slate-500">
            Sign in to save your health data securely
          </p>
        </div>

        <div className="card p-6">
          <div className="mb-5 flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg py-2 transition-colors ${
                mode === "login" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-lg py-2 transition-colors ${
                mode === "signup" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="label-text">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-4 w-4 text-teal-600" />
                    Full name
                  </span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="input-field"
                  required
                />
              </div>
            )}
            <div>
              <label className="label-text">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-teal-600" />
                  Email
                </span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-text">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-teal-600" />
                  Password
                </span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                className="input-field"
                required
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : mode === "signup" ? (
                "Create Account"
              ) : (
                "Log In"
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Your health data is private to your account. See our privacy note
          in-app before entering sensitive information.
        </p>
      </div>
    </div>
  );
}

function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code.includes("email-already-in-use")) return "An account with this email already exists — try logging in instead.";
  if (code.includes("invalid-credential") || code.includes("wrong-password")) return "Incorrect email or password.";
  if (code.includes("user-not-found")) return "No account found with this email.";
  if (code.includes("weak-password")) return "Password should be at least 6 characters.";
  if (code.includes("invalid-email")) return "Please enter a valid email address.";
  return "Something went wrong. Please try again.";
}
