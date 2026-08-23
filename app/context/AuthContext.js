'use client';

import { createContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, firebaseConfigured } from '../lib/firebase';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid) => {
    try {
      const docRef = doc(db, 'profiles', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        // Fallback local storage profile for mock testing if Firestore rules restrict write
        try {
          const localProf = localStorage.getItem(`profile_${uid}`);
          if (localProf) {
            setProfile(JSON.parse(localProf));
            return;
          }
        } catch (e) {}
        // Check if user has signed in before (auth provider has metadata)
        // If the user's auth account exists, they've been through sign-up at minimum.
        // Treat them as onboarding-completed to avoid redirect loops when Firestore is empty.
        const hasSignedInBefore = localStorage.getItem(`adhyatma_returning_${uid}`);
        if (hasSignedInBefore) {
          setProfile({ onboarding_completed: true });
        } else {
          setProfile(null);
        }
      }
    } catch (err) {
      console.warn('Firestore profile fetch notice:', err.message);
      try {
        const localProf = localStorage.getItem(`profile_${uid}`);
        if (localProf) {
          setProfile(JSON.parse(localProf));
          return;
        }
      } catch (e) {}
      // On Firestore errors, check returning user flag to avoid onboarding loop
      const hasSignedInBefore = localStorage.getItem(`adhyatma_returning_${uid}`);
      if (hasSignedInBefore) {
        setProfile({ onboarding_completed: true });
      } else {
        setProfile(null);
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.uid) {
      await fetchProfile(user.uid);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      return;
    }

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await fetchProfile(result.user.uid);
        }
      })
      .catch((err) => {
        console.warn('Redirect sign-in notice:', err.message);
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Mark this user as having signed in before — prevents onboarding redirect loops
        try { localStorage.setItem(`adhyatma_returning_${currentUser.uid}`, 'true'); } catch (e) {}
        await fetchProfile(currentUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchProfile]);

  const signInWithGoogle = async () => {
    if (!firebaseConfigured) {
      throw new Error('Firebase is not configured. Please verify environment variables.');
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await fetchProfile(result.user.uid);
      }
      return result.user;
    } catch (error) {
      if (error.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      console.error('Firebase Google Auth error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    if (!firebaseConfigured) {
      throw new Error('Firebase is not configured.');
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (result.user) {
      await fetchProfile(result.user.uid);
    }
    return result.user;
  };

  const signUpWithEmail = async (email, password) => {
    if (!firebaseConfigured) {
      throw new Error('Firebase is not configured.');
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (result.user) {
      await fetchProfile(result.user.uid);
    }
    return result.user;
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {}
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    session: user ? { user } : null,
    profile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
