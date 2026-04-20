// components/notifications/RankingToast.jsx
import { useEffect, useRef } from 'react';
import styles from './RankingToast.module.css';

export default function RankingToast({ visible, icon, message, type = 'neutral', onDismiss }) {
  const timer = useRef(null);

  useEffect(() => {
    if (visible) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => onDismiss?.(), 6000);
    }
    return () => clearTimeout(timer.current);
  }, [visible, message, onDismiss]);

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${visible ? styles.visible : ''}`}
      onClick={onDismiss}
      role="status"
      aria-live="polite"
    >
      <span className={styles.toastIcon}>{icon}</span>
      <span className={styles.toastMsg}>{message}</span>
    </div>
  );
}
