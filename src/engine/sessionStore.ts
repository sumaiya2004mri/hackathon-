import type { TriageSession } from '../types';

const KEY = 'ea_triage_sessions';

export function loadSessions(userId: string): TriageSession[] {
  const raw = localStorage.getItem(`${KEY}:${userId}`);
  return raw ? JSON.parse(raw) : [];
}

export function saveSession(userId: string, session: TriageSession) {
  const existing = loadSessions(userId);
  localStorage.setItem(`${KEY}:${userId}`, JSON.stringify([...existing, session]));
}

// NOTE: this is a local-only store for the prototype. In production, mirror
// writes to Firestore under /users/{uid}/triageSessions/{id} so history
// persists across devices and can be viewed by the account owner only
// (see README privacy section for suggested security rules).
