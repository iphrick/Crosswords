// components/layout/Header.jsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAvatarHeadUrl } from '@/lib/juriMessages';
import styles from './Header.module.css';

export default function Header({ onLoginClick, onRegisterClick, onRankingClick, onAvatarEdit }) {
  const { user, gameState, logout } = useAuth();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const nickname    = gameState?.nickname;
  const avatarData  = gameState?.avatar;
  const fallback    = user?.email ? user.email.split('@')[0] : user?.phoneNumber;
  const displayName = nickname || fallback || '';
  const headUrl     = avatarData ? getAvatarHeadUrl(avatarData.username) : null;

  return (
    <header className={styles.header}>
      <a href="/" className={styles.logo}>
        <span className={styles.logoIcon}>⚖</span>
        <span className={styles.logoTitle}>JuriQuest</span>
      </a>

      {/* Desktop nav */}
      <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`} aria-label="Navegação principal">
        {!user ? (
          <>
            <button id="login-modal-btn"    className="btn btn--secondary" onClick={() => { onLoginClick();    setMenuOpen(false); }}>Entrar</button>
            <button id="register-modal-btn" className="btn btn--secondary" onClick={() => { onRegisterClick(); setMenuOpen(false); }}>Cadastrar</button>
            <button id="ranking-modal-btn"  className="btn btn--secondary" onClick={() => { onRankingClick();  setMenuOpen(false); }}>Ranking</button>
          </>
        ) : (
          <>
            <button id="ranking-modal-btn" className="btn btn--secondary" onClick={() => { onRankingClick(); setMenuOpen(false); }}>
              🏆 Ranking
            </button>

            {/* Avatar dropdown */}
            <div className={styles.avatarMenu}>
              <button
                className={styles.avatarBtn}
                onClick={() => setAvatarOpen(o => !o)}
                aria-expanded={avatarOpen}
                aria-label="Menu de avatar"
              >
                {headUrl
                  ? <img src={headUrl} alt="Avatar" className={styles.avatarThumb} />
                  : <span className={styles.avatarEmoji}>🧑‍⚖️</span>
                }
                <span className={styles.avatarName}>{displayName}</span>
                <span className={styles.avatarCaret}>▾</span>
              </button>

              {avatarOpen && (
                <div className={styles.dropdown}>
                  <button className="btn btn--ghost" style={{width:'100%', justifyContent:'flex-start'}}
                    onClick={() => { setAvatarOpen(false); onAvatarEdit?.(); }}>
                    👤 {avatarData ? 'Modificar Avatar' : 'Criar Avatar'}
                  </button>
                  <button className="btn btn--danger" style={{width:'100%', justifyContent:'flex-start'}}
                    onClick={() => { setAvatarOpen(false); logout(); }}>
                    Sair
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </nav>

      {/* Hamburger (mobile) */}
      <button
        className={`${styles.hamburger} ${menuOpen ? styles.active : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>
    </header>
  );
}
