// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase-client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [gameState, setGameState] = useState(null); // Firestore user doc
  const [loading, setLoading]   = useState(true);

  // ---- Firestore helpers ----
  async function loadGameState(u) {
    const ref  = doc(db, 'users', u.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
    const initial = { email: u.email || null, subjects: {}, avatar: null, nickname: null };
    await setDoc(ref, initial);
    return initial;
  }

  async function saveGameState(uid, data) {
    await setDoc(doc(db, 'users', uid), data);
  }

  // ---- Auth state listener ----
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const gs = await loadGameState(u);
        setUser(u);
        setGameState(gs);
      } else {
        setUser(null);
        setGameState(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ---- Auth actions ----
  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email, password) {
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
  }

  function setupRecaptcha(containerId) {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
    }
    return window.recaptchaVerifier;
  }

  async function sendPhoneCode(phone) {
    const verifier = setupRecaptcha('recaptcha-container');
    const result   = await signInWithPhoneNumber(auth, phone, verifier);
    return result; // store confirmationResult in component
  }

  // ---- GameState mutations ----
  function getSubjectState(subject) {
    const gs = gameState || {};
    if (!gs.subjects) gs.subjects = {};
    if (!gs.subjects[subject]) {
      gs.subjects[subject] = { level: 1, usedWords: [], score: 0, isLevelCompleted: false };
    }
    return gs.subjects[subject];
  }

  async function updateGameState(updater) {
    setGameState(prev => {
      const next = { 
        ...prev,
        subjects: prev?.subjects ? { ...prev.subjects } : {}
      };
      updater(next);
      if (user) saveGameState(user.uid, next).catch(console.error);
      return next;
    });
  }

  const value = {
    user,
    gameState,
    loading,
    login,
    register,
    logout,
    sendPhoneCode,
    updateGameState,
    getSubjectState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
