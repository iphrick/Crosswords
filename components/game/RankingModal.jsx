// components/game/RankingModal.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import JuridicalAvatar from '../avatar/JuridicalAvatar';
import styles from '../auth/Modal.module.css';

export default function RankingModal({ visible, onClose }) {
  const { gameState } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      fetch('/api/get-ranking')
        .then(res => res.json())
        .then(data => {
          setRanking(data.ranking || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="ranking-title" style={{ maxWidth: '500px' }}>
        <button className={styles.close} onClick={onClose} aria-label="Fechar">×</button>
        <h2 id="ranking-title" className={styles.title}>🏆 Ranking Global</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
            Carregando ranking...
          </div>
        ) : (
          <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
            {ranking.length === 0 ? (
              <p className={styles.info}>Nenhum jogador pontuou ainda.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ranking.map((user, idx) => {
                  const isMe = gameState?.nickname && user.name?.toLowerCase() === gameState.nickname.toLowerCase();
                  return (
                    <li key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '12px', 
                      background: isMe ? 'var(--color-surface)' : 'var(--color-surface-2)',
                      border: isMe ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', minWidth: '35px', color: idx < 3 ? 'var(--color-accent)' : 'inherit' }}>
                        {idx + 1}º
                      </span>
                      <div style={{ margin: '0 15px', display: 'flex', alignItems: 'center' }}>
                        {user.avatar ? (
                          <JuridicalAvatar {...user.avatar} size={32} />
                        ) : (
                          <span style={{ fontSize: '32px' }}>🧑‍⚖️</span>
                        )}
                      </div>
                      <span style={{ flex: 1, fontWeight: isMe ? 'bold' : 'normal' }}>
                        {user.name || 'Anônimo'}
                      </span>
                      <strong style={{ color: 'var(--color-accent)' }}>
                        {user.score} pts
                      </strong>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
