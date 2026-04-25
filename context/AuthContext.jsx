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

  async function sendPhoneCode(phone) {
    // Sanitize phone number (remove spaces, hyphens, parentheses)
    const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
    
    // Ensure recaptcha-container exists before initializing
    if (!document.getElementById('recaptcha-container')) {
      throw new Error('Container do ReCAPTCHA não encontrado.');
    }

    // Always clear existing verifier if any, to avoid stale references to removed DOM elements
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn("Erro ao limpar verifier:", e);
      }
      window.recaptchaVerifier = null;
    }

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // ReCAPTCHA solved
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      });

      const result = await signInWithPhoneNumber(auth, cleanPhone, window.recaptchaVerifier);
      return result;
    } catch (error) {
      // If error occurs, clear verifier to allow retry
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      throw error;
    }
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

  async function checkUsername(username) {
    if (!username || username.length < 3) return { available: false, error: 'Muito curto' };
    const url = `/api/auth/check-username?username=${encodeURIComponent(username)}&uid=${user?.uid || ''}`;
    const res = await fetch(url);
    const data = await res.json();
    return { available: data.available, error: data.error };
  }

  async function updateUsername(username) {
    if (!user) throw new Error('Não autenticado');
    const res = await fetch('/api/auth/update-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: user.uid, username })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar username');
    
    // Atualiza estado local
    setGameState(prev => ({ ...prev, nickname: username }));
    return data;
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
    checkUsername,
    updateUsername,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
