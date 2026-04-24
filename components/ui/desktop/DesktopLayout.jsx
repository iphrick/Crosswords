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
            <section className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl mb-12 shadow-2xl flex flex-wrap items-end justify-between gap-8">
              <div className="flex flex-wrap items-center gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-1">Matéria de Estudo</label>
                  <select
                    id="subject-select"
                    className="bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 min-w-[240px] focus:ring-2 focus:ring-[#c9a96e] outline-none transition-all font-bold"
                    value={subject}
                    onChange={e => { setSubject(e.target.value); }}
                  >
                    {modals.SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex gap-8 border-l border-slate-800 pl-8">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Nível</p>
                    <p className="text-2xl font-black text-[#c9a96e]">{gs.level}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Pontos</p>
                    <p className="text-2xl font-black text-white">{gs.score}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!showNextLvl ? (
                  <button id="generate-btn" className="px-8 py-3.5 bg-[#c9a96e] text-slate-950 font-black rounded-xl hover:bg-[#d4b47a] transition-all transform active:scale-95 shadow-lg shadow-[#c9a96e]/10" onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? 'Gerando…' : `Gerar Nível ${gs.level}`}
                  </button>
                ) : (
                  <button className="px-8 py-3.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-500 transition-all transform active:scale-95 shadow-lg shadow-emerald-600/20" onClick={handleNextLevel}>Próximo Nível</button>
                )}
                <button className="px-6 py-3.5 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-all" onClick={handleReset}>Resetar</button>
                {isAdmin && <button className="p-3.5 bg-red-600 text-white rounded-xl" onClick={handleAdminSeed}>⚙️</button>}
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
                    <div className="flex gap-4 mt-8 justify-center">
                      <button id="hint-btn" className="flex items-center gap-2 px-8 py-4 bg-slate-900/50 border border-slate-800 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl" onClick={handleHint}>
                        💡 Pedir Dica
                      </button>
                      <button className="flex items-center gap-2 px-8 py-4 bg-slate-900/50 border border-slate-800 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all" onClick={handleClear}>
                        🗑 Limpar Tudo
                      </button>
                      <button className="flex items-center gap-2 px-8 py-4 bg-red-950/30 border border-red-900/30 text-red-400 font-bold rounded-2xl hover:bg-red-900/20 transition-all" onClick={handleRevealAll}>
                        👁 Revelar Tudo
                      </button>
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
