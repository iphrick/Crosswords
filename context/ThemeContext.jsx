// context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

const ThemeContext = createContext(null);

export const THEMES = [
  { id: 'default',   name: 'Padrão',    icon: '🌙' },
  { id: 'world-cup', name: 'Copa 2026', icon: '⚽' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '🧬' },
  { id: 'forest',    name: 'Floresta',  icon: '🌿' },
  { id: 'royal',     name: 'Imperial',  icon: '👑' },
];

// Theme color definitions — applied directly via JS to :root
const THEME_VARS = {
  default: {
    '--color-bg':          '#0e1117',
    '--color-surface':     '#161b27',
    '--color-surface-2':   '#1e2535',
    '--color-border':      '#2a3347',
    '--color-accent':      '#c9a96e',
    '--color-accent-dim':  'rgba(201, 169, 110, 0.15)',
    '--color-text':        '#e8e2d6',
    '--color-text-muted':  '#7a8499',
    '--color-correct':     '#4caf7d',
    '--color-wrong':       '#e05c5c',
    '--color-cell-active': '#263045',
  },
  'world-cup': {
    '--color-bg':          '#004b23',
    '--color-surface':     '#006400',
    '--color-surface-2':   '#007200',
    '--color-border':      '#ffcc00',
    '--color-accent':      '#ffcc00',
    '--color-accent-dim':  'rgba(255, 204, 0, 0.2)',
    '--color-text':        '#ffffff',
    '--color-text-muted':  '#a8e6cf',
    '--color-correct':     '#2ecc71',
    '--color-wrong':       '#ff4d4d',
    '--color-cell-active': '#002776',
  },
  cyberpunk: {
    '--color-bg':          '#0b0e14',
    '--color-surface':     '#151921',
    '--color-surface-2':   '#1c222d',
    '--color-border':      '#00ffff',
    '--color-accent':      '#ff00ff',
    '--color-accent-dim':  'rgba(255, 0, 255, 0.15)',
    '--color-text':        '#ffffff',
    '--color-text-muted':  '#8b949e',
    '--color-correct':     '#00ff00',
    '--color-wrong':       '#ff0000',
    '--color-cell-active': '#00ffff',
  },
  forest: {
    '--color-bg':          '#1a2e1a',
    '--color-surface':     '#2d4a2d',
    '--color-surface-2':   '#3d613d',
    '--color-border':      '#8b5e3c',
    '--color-accent':      '#a3c1ad',
    '--color-accent-dim':  'rgba(163, 193, 173, 0.15)',
    '--color-text':        '#f0f7f0',
    '--color-text-muted':  '#8da38d',
    '--color-correct':     '#7fb3d5',
    '--color-wrong':       '#cd6155',
    '--color-cell-active': '#4a7a4a',
  },
  royal: {
    '--color-bg':          '#0a0a2a',
    '--color-surface':     '#1a1a4a',
    '--color-surface-2':   '#2a2a6a',
    '--color-border':      '#d4af37',
    '--color-accent':      '#d4af37',
    '--color-accent-dim':  'rgba(212, 175, 55, 0.15)',
    '--color-text':        '#ffffff',
    '--color-text-muted':  '#a0a0c0',
    '--color-correct':     '#2ecc71',
    '--color-wrong':       '#e74c3c',
    '--color-cell-active': '#3a3a8a',
  },
};

function applyThemeToDOM(themeId) {
  const vars = THEME_VARS[themeId] || THEME_VARS.default;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'appearance');

    const unsub = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) {
        const themeId = snap.data().activeTheme || 'default';
        setCurrentTheme(themeId);
        applyThemeToDOM(themeId);
      } else {
        setDoc(settingsRef, { activeTheme: 'default' });
      }
    }, (error) => {
      console.error('Theme listener error:', error);
    });

    return () => unsub();
  }, []);

  async function updateGlobalTheme(themeId) {
    const settingsRef = doc(db, 'settings', 'appearance');
    await setDoc(settingsRef, { activeTheme: themeId }, { merge: true });
    // Also apply immediately for the admin
    setCurrentTheme(themeId);
    applyThemeToDOM(themeId);
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
