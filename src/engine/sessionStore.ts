import type { TriageSession } from '../types';
import { readCollection, appendToCollection } from '../services/dataStore';

export async function loadSessions(userId: string, isGuest: boolean): Promise<TriageSession[]> {
  return readCollection<TriageSession>(userId, isGuest, 'triageSessions');
}

export async function saveSession(userId: string, isGuest: boolean, session: TriageSession): Promise<void> {
  await appendToCollection(userId, isGuest, 'triageSessions', session);
}
