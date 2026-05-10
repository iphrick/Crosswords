// context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

const ThemeContext = createContext(null);

export const THEMES = [
  { id: 'default',   name: 'Padrão',     icon: '🌙' },
  { id: 'world-cup', name: 'Copa 2026', icon: '⚽' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '🧬' },
  { id: 'forest',    name: 'Floresta',  icon: '🌿' },
  { id: 'royal',     name: 'Imperial',  icon: '👑' },
];

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    // Listen to global settings
    const settingsRef = doc(db, 'settings', 'appearance');
    
    const unsub = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) {
        const themeId = snap.data().activeTheme || 'default';
        setCurrentTheme(themeId);
        document.documentElement.setAttribute('data-theme', themeId);
      } else {
        // Initialize if not exists
        setDoc(settingsRef, { activeTheme: 'default' });
      }
    });

    return () => unsub();
  }, []);

  async function updateGlobalTheme(themeId) {
    const settingsRef = doc(db, 'settings', 'appearance');
    await setDoc(settingsRef, { activeTheme: themeId }, { merge: true });
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, updateGlobalTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
