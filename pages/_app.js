// pages/_app.js
import { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  // Register Service Worker for push notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemeWrapper>
          <Component {...pageProps} />
        </ThemeWrapper>
      </ThemeProvider>
    </AuthProvider>
  );
}

function ThemeWrapper({ children }) {
  const { currentTheme } = useTheme();
  return (
    <div className={`theme-${currentTheme}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}


