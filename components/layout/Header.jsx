// components/layout/Header.jsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header({ onLoginClick, onRegisterClick, onRankingClick, onContactClick, onTutorialClick, onAvatarClick }) {
  const { user, gameState, logout } = useAuth();
  const { currentTheme, updateGlobalTheme, THEMES } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const nickname    = gameState?.nickname;
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

      {/* Navigation Actions */}
      <div className={styles.actions}>
        {!user ? (
          <nav className={styles.nav}>
            <button className="btn btn--secondary" onClick={onLoginClick}>Entrar</button>
            <button className="btn btn--primary" onClick={onRegisterClick}>Cadastrar</button>
          </nav>
        ) : (
          <div className={styles.menuContainer}>
            <span className={styles.menuLabel}>Menu Principal</span>
            <div className={styles.avatarMenu}>
              <button
                className={styles.menuTrigger}
                onClick={() => setUserMenuOpen(o => !o)}
                aria-expanded={userMenuOpen}
              >
                <div className={styles.avatarWrapper}>
                  {gameState?.avatarUrl ? (
                    <img src={gameState.avatarUrl} alt="" className={styles.avatarImg} />
                  ) : (
                    <span className="text-xl">🧑‍⚖️</span>
                  )}
                </div>
                <div className="hidden md:flex flex-col items-start leading-none gap-0.5">
                  <span className={styles.triggerName}>{displayName}</span>
                  {profession && <span className={styles.triggerSub}>{profession}</span>}
                </div>
                <span className={styles.caret}>{userMenuOpen ? '▴' : '▾'}</span>
              </button>

              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40 mb-1">Menu Principal</p>
                  </div>

                  {/* Theme Selector inside Dropdown */}
                  <div className={styles.dropdownSection}>
                    <div className={styles.themeSelector}>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Tema</span>
                      <select 
                        className={styles.themeSelect}
                        value={currentTheme}
                        onChange={(e) => updateGlobalTheme(e.target.value)}
                      >
                        {THEMES.map(t => (
                          <option key={t.id} value={t.id} className="bg-slate-950 text-white">
                            {t.icon} {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.dropdownDivider} />

                  <button className={styles.dropdownItem} onClick={() => { setUserMenuOpen(false); onRankingClick(); }}>
                    <span className="text-lg">🏆</span>
                    <span>Ranking Global</span>
                  </button>

                  <button className={styles.dropdownItem} onClick={() => { setUserMenuOpen(false); onAvatarClick(); }}>
                    <span className="text-lg">🎭</span>
                    <span>Identidade</span>
                  </button>

                  <button className={styles.dropdownItem} onClick={() => { setUserMenuOpen(false); onTutorialClick(); }}>
                    <span className="text-lg">📖</span>
                    <span>Instruções</span>
                  </button>

                  <button className={styles.dropdownItem} onClick={() => { setUserMenuOpen(false); onContactClick(); }}>
                    <span className="text-lg">💬</span>
                    <span>Suporte</span>
                  </button>

                  {isAdmin && (
                    <Link href="/admin" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <span className="text-lg">⚙️</span>
                      <span>Admin</span>
                    </Link>
                  )}

                  <div className={styles.dropdownDivider} />

                  <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={() => { setUserMenuOpen(false); logout(); }}>
                    <span className="text-lg">🚪</span>
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </header>
  );
}

