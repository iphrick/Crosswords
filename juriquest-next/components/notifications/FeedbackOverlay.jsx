// components/notifications/FeedbackOverlay.jsx
import { useEffect, useRef } from 'react';
import styles from './FeedbackOverlay.module.css';

export default function FeedbackOverlay({ visible, icon, message, type = 'neutral', onClose }) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (visible) btnRef.current?.focus();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    // Vibração mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'error')   navigator.vibrate([100, 50, 100, 50, 200]);
      if (type === 'success') navigator.vibrate([50, 30, 100]);
    }
  }, [visible, type]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && visible) onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`${styles.overlay} ${styles[type]}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Resultado da fase"
    >
      <div className={styles.card}>
        <div className={styles.icon} aria-hidden="true">{icon}</div>
        <p className={styles.message}>{message}</p>
        <button ref={btnRef} className={styles.btn} onClick={onClose}>
          OK, Excelência!
        </button>
      </div>
    </div>
  );
}
