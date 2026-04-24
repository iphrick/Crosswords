import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is mobile based on viewport width.
 * Breakpoint: 768px (standard tablet/mobile threshold)
 */
export function useDevice() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkSize();
    setIsLoaded(true);

    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return { isMobile, isLoaded };
}
