import { useState, useEffect } from 'react';
import type { KickSession } from '../../types';

const STORAGE_KEY = 'ea_kick_sessions';

function loadSessions(userId: string): KickSession[] {
  const raw = localStorage.getItem(`${STORAGE_KEY}:${userId}`);
  return raw ? JSON.parse(raw) : [];
}
function saveSessions(userId: string, sessions: KickSession[]) {
  localStorage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(sessions));
}

export default function KickCounter({ userId }: { userId: string }) {
  const [sessions, setSessions] = useState<KickSession[]>(() => loadSessions(userId));
  const [active, setActive] = useState<KickSession | null>(null);

  useEffect(() => saveSessions(userId, sessions), [sessions, userId]);

  function startSession() {
    setActive({ id: crypto.randomUUID(), startedAt: new Date().toISOString(), kickTimestamps: [], durationMinutes: 0 });
  }

  function logKick() {
    if (!active) return;
    setActive({ ...active, kickTimestamps: [...active.kickTimestamps, new Date().toISOString()] });
  }

  function finishSession() {
    if (!active) return;
    const duration = Math.round((Date.now() - new Date(active.startedAt).getTime()) / 60000);
    const finished = { ...active, durationMinutes: duration };
    setSessions((s) => [...s, finished]);
    setActive(null);
  }

  const last7 = sessions.slice(-7);
  const avgKicksToTen = last7.length
    ? Math.round(last7.reduce((a, s) => a + (s.durationMinutes || 1), 0) / last7.length)
    : null;

  const recentDropOff = sessions.length >= 4 &&
    sessions.slice(-1)[0].kickTimestamps.length < 10 &&
    sessions.slice(-4, -1).every((s) => s.kickTimestamps.length >= 10);

  return (
    <div className="card p-4 space-y-3">
      <h3 className="font-medium">Kick counter</h3>
      <p className="text-xs text-clinical-muted">Tap "Log kick" each time you feel movement. Many providers suggest counting 10 movements and noting how long it takes.</p>

      {!active ? (
        <button onClick={startSession} className="text-sm px-4 py-2 rounded-md bg-clinical-accent/15 text-clinical-accent border border-clinical-accent/30">
          Start session
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-2xl font-display font-semibold text-clinical-teal">{active.kickTimestamps.length} kicks</p>
          <div className="flex gap-2">
            <button onClick={logKick} className="text-sm px-4 py-2 rounded-md bg-clinical-teal/15 text-clinical-teal border border-clinical-teal/30">
              Log kick
            </button>
            <button onClick={finishSession} className="text-sm px-4 py-2 rounded-md bg-clinical-panel2 border border-clinical-border">
              End session
            </button>
          </div>
        </div>
      )}

      {recentDropOff && (
        <p className="text-sm bg-severity-URGENT/10 border border-severity-URGENT/30 text-severity-URGENT rounded-md p-3">
          Movement in your last session was noticeably lower than your recent sessions. If you don't feel improved movement soon, please contact your provider or go in for assessment — reduced fetal movement should always be checked.
        </p>
      )}

      {avgKicksToTen !== null && (
        <p className="text-xs text-clinical-muted">Recent average session length: {avgKicksToTen} min ({last7.length} sessions logged)</p>
      )}
    </div>
  );
}
