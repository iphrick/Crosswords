// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
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
    const initial = { email: u.email || null, subjects: {}, nickname: null };
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
    let cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
    
    // Ensure it starts with +
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }

    // Ensure recaptcha-container exists before initializing
    const container = document.getElementById('recaptcha-container');
    if (!container) {
      throw new Error('Container do ReCAPTCHA não encontrado.');
    }

    try {
      const { RecaptchaVerifier } = await import('firebase/auth');
      
      // If we already have a verifier, reuse it but ensure it's rendered
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });
      }
      
      // Explicitly render to be safe
      await window.recaptchaVerifier.render();

      const result = await signInWithPhoneNumber(auth, cleanPhone, window.recaptchaVerifier);
      return result;
    } catch (error) {
      console.error("Firebase Phone Auth Error:", error);
      // If error occurs, it might be because the verifier is stale
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch(e){}
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
