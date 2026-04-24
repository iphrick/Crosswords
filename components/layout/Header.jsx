// components/layout/Header.jsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './Header.module.css';

export default function Header({ onLoginClick, onRegisterClick, onRankingClick, onContactClick, onAvatarClick, onTutorialClick }) {
  const { user, gameState, logout } = useAuth();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const nickname    = gameState?.nickname;
  const avatarUrl   = gameState?.avatarUrl;
  const profession  = gameState?.profession;
  const fallback    = user?.email ? user.email.split('@')[0] : user?.phoneNumber;
  const displayName = nickname || fallback || '';
  const ADMIN_EMAIL = 'pedrohenriqueinsec281@gmail.com';
  const isAdmin = user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

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
            <button id="contact-modal-btn"  className="btn btn--ghost" onClick={() => { onContactClick(); setMenuOpen(false); }}>Contato</button>
          </>
        ) : (
          <>
            <button id="ranking-modal-btn" className="btn btn--secondary" onClick={() => { onRankingClick(); setMenuOpen(false); }}>
              🏆 Ranking
            </button>
            <button id="tutorial-btn" className="btn btn--secondary" onClick={() => { onTutorialClick(); setMenuOpen(false); }}>
              📖 Instruções
            </button>
            <button id="contact-modal-btn" className="btn btn--ghost" onClick={() => { onContactClick(); setMenuOpen(false); }}>
              Contato
            </button>
            
            {isAdmin && (
              <a href="/admin/feedbacks" className="btn btn--primary" style={{backgroundColor: '#10b981', color: 'white', borderColor: '#059669'}}>
                ⚙️ Admin
              </a>
            )}

            {/* User dropdown */}
            <div className={styles.avatarMenu}>
              <button
                className={styles.avatarBtn}
                onClick={() => setUserMenuOpen(o => !o)}
                aria-expanded={userMenuOpen}
                aria-label="Menu de usuário"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-emerald-500 shadow-lg object-cover" />
                ) : (
                  <span className="text-2xl">🧑‍⚖️</span>
                )}
                <div className="flex flex-col items-start leading-tight ml-1">
                  <span className="text-base font-bold text-white tracking-tight">{displayName}</span>
                  {profession && <span className="text-[11px] text-emerald-400 uppercase font-extrabold tracking-wider">{profession}</span>}
                </div>
                <span className={styles.avatarCaret}>▾</span>
              </button>

              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <button 
                    className="btn btn--secondary" 
                    style={{width:'100%', justifyContent:'flex-start', marginBottom: '8px'}}
                    onClick={() => { setUserMenuOpen(false); onAvatarClick(); }}
                  >
                    🎭 Alterar Avatar
                  </button>
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
