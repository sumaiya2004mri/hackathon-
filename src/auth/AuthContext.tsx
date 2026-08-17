import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '../types';
import { FIREBASE_CONFIGURED, getFirebaseAuth } from './firebaseConfig';

interface AuthContextValue {
  user: User;
  isAuthenticated: boolean; // false while in guest mode
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => void;
}

const GUEST_USER: User = {
  id: 'guest-local',
  isGuest: true,
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // CRITICAL: default state is guest mode. Emergency triage and the
  // critical-symptoms banner must work immediately with zero auth steps.
  const [user, setUser] = useState<User>(() => {
    const cached = localStorage.getItem('ea_user_profile');
    return cached ? JSON.parse(cached) : GUEST_USER;
  });

  useEffect(() => {
    localStorage.setItem('ea_user_profile', JSON.stringify(user));
  }, [user]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    if (!FIREBASE_CONFIGURED) {
      throw new Error('Firebase is not configured yet. Add VITE_FIREBASE_* env vars — see README.');
    }
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    setUser((u) => ({ ...u, id: cred.user.uid, isGuest: false }));
  }, []);

  const signupWithEmail = useCallback(async (email: string, password: string) => {
    if (!FIREBASE_CONFIGURED) {
      throw new Error('Firebase is not configured yet. Add VITE_FIREBASE_* env vars — see README.');
    }
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    setUser((u) => ({ ...u, id: cred.user.uid, isGuest: false }));
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!FIREBASE_CONFIGURED) {
      throw new Error('Firebase is not configured yet. Add VITE_FIREBASE_* env vars — see README.');
    }
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const cred = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
    setUser((u) => ({ ...u, id: cred.user.uid, isGuest: false, name: cred.user.displayName ?? undefined }));
  }, []);

  const logout = useCallback(async () => {
    if (FIREBASE_CONFIGURED) {
      const { signOut } = await import('firebase/auth');
      await signOut(getFirebaseAuth());
    }
    setUser(GUEST_USER);
  }, []);

  const updateProfile = useCallback((patch: Partial<User>) => {
    setUser((u) => ({ ...u, ...patch }));
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !user.isGuest,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
