// components/game/RankingModal.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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
                        background: isMe ? 'rgba(16, 185, 129, 0.05)' : 'rgba(30, 41, 59, 0.5)',
                        border: isMe ? '1px solid #10b981' : '1px solid #334155',
                        borderRadius: '12px',
                        transition: 'transform 0.2s'
                      }}>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', minWidth: '30px', color: idx < 3 ? '#fbbf24' : '#64748b' }}>
                          {idx + 1}º
                        </span>
                        <div style={{ margin: '0 12px', position: 'relative' }}>
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt="Avatar" 
                              style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #334155', objectCover: 'cover' }} 
                            />
                          ) : (
                            <span style={{ fontSize: '24px' }}>🧑‍⚖️</span>
                          )}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 'bold', color: isMe ? '#fff' : '#cbd5e1', fontSize: '0.95rem' }}>
                            {user.name || 'Anônimo'}
                          </span>
                          {user.profession && (
                            <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.02em' }}>
                              {user.profession}
                            </span>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ color: '#10b981', display: 'block', fontSize: '1.1rem' }}>
                            {user.totalScore}
                          </strong>
                          <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>pts</span>
                        </div>
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
