// ============================================================================
// UNIFIED DATA STORE
//
// Single point of truth for persistence. Behavior:
//   - Guest mode (no Firebase config, or user.isGuest) -> localStorage only.
//     This is required: emergency triage must work fully offline / with zero
//     account setup.
//   - Signed-in user + Firebase configured -> writes go to Firestore under
//     /users/{uid}/{collection}/{docId}, AND mirror to localStorage as a
//     read-through cache so the UI never blocks on network latency.
//   - If a Firestore write fails (offline, quota, etc.) we swallow the error
//     and keep the local copy — Firestore's own offline persistence will
//     sync it once connectivity returns.
//
// This replaces the ad-hoc localStorage.getItem/setItem calls that were
// scattered across sessionStore.ts, PeriodModule.tsx, and PregnancyModule.tsx
// in the initial prototype pass.
// ============================================================================

import { FIREBASE_CONFIGURED, getFirestoreDb } from '../auth/firebaseConfig';

export type CollectionName = 'triageSessions' | 'periodLogs' | 'pregnancyProfile' | 'symptomEntries' | 'vitals';

function localKey(userId: string, collection: CollectionName) {
  return `ea_${collection}:${userId}`;
}

async function firestoreAvailable(isGuest: boolean): Promise<boolean> {
  return FIREBASE_CONFIGURED && !isGuest;
}

/** Read a collection (array) of documents for a user. */
export async function readCollection<T>(userId: string, isGuest: boolean, collection: CollectionName): Promise<T[]> {
  const cached = localStorage.getItem(localKey(userId, collection));
  const cachedValue: T[] = cached ? JSON.parse(cached) : [];

  if (!(await firestoreAvailable(isGuest))) return cachedValue;

  try {
    const { collection: fsCollection, getDocs, query, orderBy } = await import('firebase/firestore');
    const db = getFirestoreDb();
    const ref = fsCollection(db, 'users', userId, collection);
    const snap = await getDocs(query(ref, orderBy('createdAt', 'asc')));
    const remote = snap.docs.map((d) => d.data() as T);
    localStorage.setItem(localKey(userId, collection), JSON.stringify(remote));
    return remote;
  } catch {
    // Offline or permission error — fall back to cache silently.
    return cachedValue;
  }
}

/** Append one document to a collection, mirroring to local cache immediately. */
export async function appendToCollection<T extends { id: string }>(
  userId: string,
  isGuest: boolean,
  collection: CollectionName,
  doc: T
): Promise<void> {
  const existing: T[] = JSON.parse(localStorage.getItem(localKey(userId, collection)) ?? '[]');
  const updated = [...existing, doc];
  localStorage.setItem(localKey(userId, collection), JSON.stringify(updated));

  if (!(await firestoreAvailable(isGuest))) return;

  try {
    const { doc: fsDoc, setDoc } = await import('firebase/firestore');
    const db = getFirestoreDb();
    await setDoc(fsDoc(db, 'users', userId, collection, doc.id), doc as Record<string, unknown>);
  } catch {
    // Will sync later via Firestore's own offline queue, or stays local-only
    // for guest-adjacent edge cases. Local cache above already has it.
  }
}

/** Read a single document (e.g. the one PregnancyProfile per user). */
export async function readSingleton<T>(userId: string, isGuest: boolean, collection: CollectionName): Promise<T | null> {
  const cached = localStorage.getItem(localKey(userId, collection));
  const cachedValue: T | null = cached ? JSON.parse(cached) : null;

  if (!(await firestoreAvailable(isGuest))) return cachedValue;

  try {
    const { doc: fsDoc, getDoc } = await import('firebase/firestore');
    const db = getFirestoreDb();
    const snap = await getDoc(fsDoc(db, 'users', userId, collection, 'profile'));
    if (!snap.exists()) return cachedValue;
    const remote = snap.data() as T;
    localStorage.setItem(localKey(userId, collection), JSON.stringify(remote));
    return remote;
  } catch {
    return cachedValue;
  }
}

export async function writeSingleton<T>(userId: string, isGuest: boolean, collection: CollectionName, value: T): Promise<void> {
  localStorage.setItem(localKey(userId, collection), JSON.stringify(value));

  if (!(await firestoreAvailable(isGuest))) return;

  try {
    const { doc: fsDoc, setDoc } = await import('firebase/firestore');
    const db = getFirestoreDb();
    await setDoc(fsDoc(db, 'users', userId, collection, 'profile'), value as Record<string, unknown>);
  } catch {
    // stays local-only until connectivity/permissions allow sync
  }
}

/** Wipe all local cache for a user (used by "delete my data" in Settings). */
export function clearLocalCache(userId: string) {
  Object.keys(localStorage)
    .filter((k) => k.startsWith('ea_') && k.includes(userId))
    .forEach((k) => localStorage.removeItem(k));
}
