// components/game/CharacterCreator.jsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CHARACTERS, getAvatarHeadUrl } from '@/lib/juriMessages';
import styles from '../auth/Modal.module.css';

export default function CharacterCreator({ visible, onClose }) {
  const { gameState, updateGameState } = useAuth();
  const [nickname, setNickname] = useState(gameState?.nickname || '');
  const [selectedChar, setSelectedChar] = useState(gameState?.avatar?.username || CHARACTERS[0].u);
  const [loading, setLoading] = useState(false);

  // Sync state when opened if user already has an avatar
  const handleOpen = () => {
    if (gameState?.nickname) setNickname(gameState.nickname);
    if (gameState?.avatar?.username) setSelectedChar(gameState.avatar.username);
  };

  if (!visible) return null;

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateGameState(gs => {
        gs.nickname = nickname;
        gs.avatar = { username: selectedChar };
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="avatar-title" style={{ maxWidth: '400px' }}>
        <button className={styles.close} onClick={onClose} aria-label="Fechar">×</button>
        <h2 id="avatar-title" className={styles.title}>Meu Avatar</h2>

        <form onSubmit={handleSave} className={styles.form}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '15px' }}>
            {CHARACTERS.map(char => (
              <button
                key={char.u}
                type="button"
                onClick={() => setSelectedChar(char.u)}
                title={char.l}
                style={{
                  background: 'none',
                  border: selectedChar === char.u ? '2px solid var(--color-accent)' : '2px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  padding: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <img src={getAvatarHeadUrl(char.u)} alt={char.l} style={{ width: '100%', borderRadius: '4px' }} />
              </button>
            ))}
          </div>

          <input 
            type="text" 
            placeholder="Seu Nickname" 
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            required 
            className={styles.input} 
            maxLength={20}
          />

          <button type="submit" className="btn btn--primary" disabled={loading} style={{width:'100%'}}>
            {loading ? 'Salvando…' : 'Salvar Avatar'}
          </button>
        </form>
      </div>
    </div>
  );
}
