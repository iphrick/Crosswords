import React from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import styles from '@/styles/Home.module.css';

const CrosswordBoard = dynamic(() => import('@/components/game/CrosswordBoard'), { ssr: false });

export default function DesktopLayout({
  user,
  gameState,
  subject,
  setSubject,
  gs,
  isLoading,
  gameVisible,
  showNextLvl,
  handleGenerate,
  handleNextLevel,
  handleReset,
  handleAdminSeed,
  isAdmin,
  hintCount,
  MAX_HINTS,
  renderHearts,
  placedWords,
  handleSolved,
  handleHint,
  handleClear,
  handleRevealAll,
  modals,
  feedback
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header
        onLoginClick={modals.setLoginOpen}
        onRegisterClick={modals.setRegisterOpen}
        onRankingClick={modals.setRankingOpen}
        onContactClick={modals.setContactOpen}
        onAvatarClick={modals.setAvatarOpen}
        onTutorialClick={modals.setTutorialOpen}
      />

      <main className="app max-w-[1600px] mx-auto px-6 py-8">
        {!user ? (
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Domine o Direito<br /><span>jogando.</span></h1>
              <p className={styles.heroSub}>
                Cruzadinhas jurídicas geradas por inteligência artificial. Treine para concursos e OAB com um método que gruda.
              </p>
              <div className={styles.heroCtas}>
                <button className="btn btn--primary text-lg px-8 py-4" onClick={() => modals.setRegisterOpen(true)}>
                  Começar Grátis
                </button>
                <button className="btn btn--ghost text-lg px-8 py-4" onClick={() => modals.setLoginOpen(true)}>
                  Já tenho conta
                </button>
              </div>
            </div>

            <div className={styles.features}>
              {[
                { icon: '🤖', title: 'IA Generativa', desc: 'Perguntas únicas geradas pelo Gemini.' },
                { icon: '📊', title: 'Ranking Global', desc: 'Compete em tempo real.' },
                { icon: '📚', title: '8 Matérias', desc: 'Constitucional, Penal, Civil e mais.' },
                { icon: '💻', title: 'Desktop Pro', desc: 'Interface otimizada para estudo intenso.' },
              ].map(f => (
                <div key={f.title} className={styles.featureCard}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className={styles.controls}>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Matéria</label>
                <select
                  id="subject-select"
                  className={styles.select}
                  value={subject}
                  onChange={e => { setSubject(e.target.value); }}
                >
                  {modals.SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Status</label>
                <div className={styles.statusDisplay}>
                  <span>Nível: <strong>{gs.level}</strong></span>
                  <span>Pontos: <strong>{gs.score}</strong></span>
                </div>
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Ações</label>
                <div className={styles.controlRow}>
                  {!showNextLvl ? (
                    <button id="generate-btn" className="btn btn--primary" onClick={handleGenerate} disabled={isLoading}>
                      {isLoading ? 'Gerando…' : `Iniciar Nível ${gs.level}`}
                    </button>
                  ) : (
                    <button className="btn btn--primary" onClick={handleNextLevel}>Próximo Nível</button>
                  )}
                  <button className="btn btn--secondary" onClick={handleReset}>Resetar</button>
                  {isAdmin && <button className="btn bg-red-600 text-white" onClick={handleAdminSeed}>⚙️ Admin</button>}
                </div>
              </div>
            </section>

            {isLoading && (
              <div className="loading mt-10">
                <div className="loading__spinner" />
                <span>Gerando cruzadinha…</span>
              </div>
            )}

            {feedback.msg && (
              <div className={`feedback feedback--${feedback.type} mt-4`}>
                {feedback.msg}
              </div>
            )}

            {gameVisible && (
              <div className="flex flex-row gap-10 items-start justify-center mt-12">
                {/* Left Side: Avatar Card */}
                {gameState?.avatarUrl && (
                  <div className="sticky top-28 flex justify-center animate-in slide-in-from-left-8 duration-1000">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 w-52 shadow-2xl">
                      <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shadow-inner">
                        <img src={gameState.avatarUrl} alt={gameState.profession} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                          <p className="text-white font-bold text-sm leading-tight mb-0.5">{gameState.profession}</p>
                          <p className="text-[10px] text-emerald-400 uppercase font-extrabold tracking-widest">{gameState.nickname}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Side: Crossword Board */}
                <div id="crossword-grid" className="flex-1 max-w-5xl">
                  {gameVisible && !showNextLvl && (
                    <div className="flex items-center gap-3 mb-4 bg-slate-900/50 w-fit px-4 py-2 rounded-full border border-slate-800">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dicas:</span>
                      <span className="text-lg">{renderHearts()}</span>
                    </div>
                  )}
                  <CrosswordBoard placedWords={placedWords} onSolved={handleSolved} />
                  {!showNextLvl && (
                    <div className={styles.boardActions}>
                      <button id="hint-btn" className="btn btn--secondary" onClick={handleHint}>💡 Dica</button>
                      <button className="btn btn--secondary" onClick={handleClear}>🗑 Limpar</button>
                      <button className="btn btn--danger"    onClick={handleRevealAll}>👁 Revelar Tudo</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
