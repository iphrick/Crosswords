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
      console.log("Theme Snapshot received:", snap.data());
      if (snap.exists()) {
        const themeId = snap.data().activeTheme || 'default';
        console.log("Setting theme to:", themeId);
        setCurrentTheme(themeId);
        
        // Remove previous theme classes
        document.body.classList.forEach(cls => {
          if (cls.startsWith('theme-')) document.body.classList.remove(cls);
        });
        document.body.classList.add(`theme-${themeId}`);
        document.documentElement.setAttribute('data-theme', themeId);

      } else {
        console.log("No theme document found, initializing...");
        setDoc(settingsRef, { activeTheme: 'default' });
      }
    }, (error) => {
      console.error("Theme Snapshot error:", error);
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
