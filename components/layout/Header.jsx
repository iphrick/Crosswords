// components/layout/Header.jsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './Header.module.css';

export default function Header({ onLoginClick, onRegisterClick, onRankingClick }) {
  const { user, gameState, logout } = useAuth();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const nickname    = gameState?.nickname;
  const fallback    = user?.email ? user.email.split('@')[0] : user?.phoneNumber;
  const displayName = nickname || fallback || '';

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

            {/* User dropdown */}
            <div className={styles.avatarMenu}>
              <button
                className={styles.avatarBtn}
                onClick={() => setUserMenuOpen(o => !o)}
                aria-expanded={userMenuOpen}
                aria-label="Menu de usuário"
              >
                <span className={styles.avatarEmoji}>🧑‍⚖️</span>
                <span className={styles.avatarName}>{displayName}</span>
                <span className={styles.avatarCaret}>▾</span>
              </button>

              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <button className="btn btn--danger" style={{width:'100%', justifyContent:'flex-start'}}
                    onClick={() => { setUserMenuOpen(false); logout(); }}>
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
