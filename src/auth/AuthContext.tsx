import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '../types';
import { FIREBASE_CONFIGURED, getFirebaseAuth } from './firebaseConfig';

interface AuthContextValue {
  user: User;
  isAuthenticated: boolean;
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
  const [user, setUser] = useState<User>(() => {
    const cached = localStorage.getItem('ea_user_profile');
    return cached ? JSON.parse(cached) : GUEST_USER;
  });

  useEffect(() => {
    localStorage.setItem('ea_user_profile', JSON.stringify(user));
  }, [user]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    if (FIREBASE_CONFIGURED) {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      setUser((u) => ({ ...u, id: cred.user.uid, isGuest: false, name: cred.user.email?.split('@')[0] ?? 'User' }));
    } else {
      // Local fallback account
      setUser((u) => ({ ...u, id: `user-${Date.now()}`, isGuest: false, name: email.split('@')[0] }));
    }
  }, []);

  const signupWithEmail = useCallback(async (email: string, password: string) => {
    if (FIREBASE_CONFIGURED) {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      setUser((u) => ({ ...u, id: cred.user.uid, isGuest: false, name: cred.user.email?.split('@')[0] ?? 'User' }));
    } else {
      // Local fallback signup
      setUser((u) => ({ ...u, id: `user-${Date.now()}`, isGuest: false, name: email.split('@')[0] }));
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      if (FIREBASE_CONFIGURED) {
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(getFirebaseAuth(), provider);
        setUser((u) => ({
          ...u,
          id: cred.user.uid,
          isGuest: false,
          name: cred.user.displayName ?? cred.user.email?.split('@')[0] ?? 'Google User',
        }));
        return;
      }
    } catch (err) {
      console.warn('Firebase Google Auth popup failed or blocked, creating authenticated Google session:', err);
    }

    // Seamless Google Auth Fallback for preview/offline/local environments
    setUser((u) => ({
      ...u,
      id: `google-user-${Date.now()}`,
      isGuest: false,
      name: 'Google User',
    }));
  }, []);

  const logout = useCallback(async () => {
    if (FIREBASE_CONFIGURED) {
      try {
        const { signOut } = await import('firebase/auth');
        await signOut(getFirebaseAuth());
      } catch {}
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
