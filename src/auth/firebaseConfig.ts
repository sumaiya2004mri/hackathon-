// Firebase Auth + Firestore chosen over Supabase for this build because:
//  - Firestore's offline persistence + simple client SDK suits a PWA-style
//    app used on patchy mobile networks in the field (primary BD use case).
//  - Firebase Auth's anonymous-auth mode maps directly onto "guest mode"
//    (see AuthContext) without extra plumbing, which matters because
//    emergency triage must NEVER be gated behind a real login.
//  - Firestore security rules give per-document field-level control, useful
//    for keeping period/pregnancy data restricted to owner-only reads.
// (Supabase/Postgres + RLS would be an equally valid choice if the team
// prefers SQL — swap this file and auth/AuthContext.tsx if so.)

import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Fill these from your Firebase project settings, or set as Vite env vars
// (VITE_FIREBASE_*) and reference import.meta.env.VITE_FIREBASE_* below.
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'REPLACE_ME',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'REPLACE_ME',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'REPLACE_ME',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'REPLACE_ME',
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID ?? 'REPLACE_ME',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? 'REPLACE_ME',
};

let app: ReturnType<typeof initializeApp> | undefined;
export function getFirebaseApp() {
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}
export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}
export function getFirestoreDb() {
  return getFirestore(getFirebaseApp());
}

export const FIREBASE_CONFIGURED = firebaseConfig.apiKey !== 'REPLACE_ME';
