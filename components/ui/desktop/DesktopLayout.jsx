import React from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SubjectPicker from '@/components/ui/SubjectPicker';
import DonationSection from '@/components/layout/DonationSection';
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
  feedback,
  timeLeft,
  isTimerRunning
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Header
        onLoginClick={modals.setLoginOpen}
        onRegisterClick={modals.setRegisterOpen}
        onRankingClick={modals.setRankingOpen}
        onContactClick={modals.setContactOpen}
        onTutorialClick={modals.setTutorialOpen}
        onAvatarClick={modals.setAvatarOpen}
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
            <section className="backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] mb-12 shadow-2xl flex flex-wrap items-center justify-center lg:justify-between gap-8 sm:gap-10 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}>
              <div className="flex flex-wrap items-center gap-12">
                {/* Subject Picker */}
                <div className="space-y-2">
                  <SubjectPicker subject={subject} setSubject={setSubject} />
                </div>

                {/* Vertical Divider - Only visible on large screens when not wrapped */}
                <div className="hidden xl:block w-px h-12 self-center opacity-20" style={{ backgroundColor: 'var(--color-border)' }} />

                {/* Stats & Hearts */}
                <div className="flex items-center gap-12">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>Nível</p>
                    <p className="text-2xl font-black" style={{ color: 'var(--color-accent)' }}>{gs.level}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>Pontos</p>
                    <p className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>{gs.score}</p>
                  </div>

                  {isTimerRunning && (
                    <div className="text-center border-l pl-12 min-w-[120px]" style={{ borderColor: 'var(--color-border)' }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>Tempo Restante</p>
                      <p className={`text-2xl font-black tabular-nums ${timeLeft < 30 ? 'text-red-500 animate-pulse' : ''}`} style={timeLeft >= 30 ? { color: 'var(--color-accent)' } : {}}>
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                      </p>
                    </div>
                  )}
                  {gameVisible && !showNextLvl && (
                    <div className="text-center px-6 py-2 rounded-2xl" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>Dicas (Corações)</p>
                      <div className="text-xl flex gap-1 justify-center">{renderHearts()}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                {!showNextLvl ? (
                  <button 
                    id="generate-btn" 
                    className="px-10 h-14 font-black rounded-2xl transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl flex items-center justify-center gap-3 min-w-[240px]" 
                    style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }}
                    onClick={handleGenerate} 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-bg)', borderTopColor: 'transparent' }} /> Gerando...</>
                    ) : (
                      <>🚀 Gerar Nível {gs.level}</>
                    )}
                  </button>
                ) : (
                  <button className="px-10 h-14 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl flex items-center justify-center gap-3 min-w-[240px]" onClick={handleNextLevel}>
                    Próximo Nível ➜
                  </button>
                )}
                <button className="px-8 h-14 font-bold rounded-2xl transition-all min-w-[140px] flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }} onClick={handleReset}>
                  Resetar
                </button>
                {isAdmin && (
                  <button className="w-14 h-14 flex items-center justify-center rounded-2xl transition-all aspect-square" style={{ backgroundColor: 'rgba(224,92,92,0.08)', color: 'var(--color-wrong)', border: '1px solid rgba(224,92,92,0.2)' }} onClick={handleAdminSeed}>
                    ⚙️
                  </button>
                )}
              </div>
            </section>

            {!gameVisible && <DonationSection />}

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
                    <div className="p-2 w-52 shadow-2xl rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                      <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-inner" style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                        <img src={gameState.avatarUrl} alt={gameState.profession} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                          <p className="font-bold text-sm leading-tight mb-0.5" style={{ color: 'var(--color-text)' }}>{gameState.profession}</p>
                          <p className="text-[10px] uppercase font-extrabold tracking-widest" style={{ color: 'var(--color-accent)' }}>{gameState.nickname}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Right Side: Crossword Board */}
                <div id="crossword-grid" className="flex-1 max-w-5xl">
                  <CrosswordBoard placedWords={placedWords} onSolved={handleSolved} />
                  {!showNextLvl && (
                    <div className="flex gap-6 mt-10 justify-center flex-wrap">
                      <button id="hint-btn" className="flex items-center justify-center gap-3 px-10 py-5 font-bold rounded-[1.5rem] hover:-translate-y-1 transition-all shadow-2xl min-w-[200px]" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} onClick={handleHint}>
                        💡 Pedir Dica
                      </button>
                      <button className="flex items-center justify-center gap-3 px-10 py-5 font-bold rounded-[1.5rem] hover:-translate-y-1 transition-all shadow-xl min-w-[200px]" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} onClick={handleClear}>
                        🗑 Limpar Tudo
                      </button>
                      <button className="flex items-center justify-center gap-3 px-10 py-5 font-bold rounded-[1.5rem] hover:-translate-y-1 transition-all min-w-[200px]" style={{ backgroundColor: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)', color: 'var(--color-wrong)' }} onClick={handleRevealAll}>
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
      <Footer />
    </div>
  );
}
