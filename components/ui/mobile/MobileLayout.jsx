import React from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SubjectPicker from '@/components/ui/SubjectPicker';
import DonationSection from '@/components/layout/DonationSection';
import styles from '@/styles/Home.module.css';

const CrosswordBoard = dynamic(() => import('@/components/game/CrosswordBoard'), { ssr: false });

export default function MobileLayout({
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
  isAdmin,
  handleAdminSeed,
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Header
        onLoginClick={modals.setLoginOpen}
        onRegisterClick={modals.setRegisterOpen}
        onRankingClick={modals.setRankingOpen}
        onContactClick={modals.setContactOpen}
        onTutorialClick={modals.setTutorialOpen}
        onAvatarClick={modals.setAvatarOpen}
      />

      <main className="flex-1 flex flex-col p-4 sm:p-6 pb-32 max-w-xl mx-auto w-full">
        {!user ? (
          <div className="flex flex-col gap-8 pt-6 sm:pt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tighter" style={{ color: 'var(--color-text)' }}>
              Domine o Direito <span style={{ color: 'var(--color-accent)' }}>jogando.</span>
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-lg sm:text-xl font-medium leading-relaxed">
              Cruzadinhas jurídicas geradas por IA. Treine onde quiser, quando quiser.
            </p>
            <div className="flex flex-col gap-4 mt-2">
              <button className="w-full py-5 font-black rounded-2xl text-lg shadow-2xl transform active:scale-95 transition-all" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }} onClick={() => modals.setRegisterOpen(true)}>
                Começar Grátis
              </button>
              <button className="w-full py-5 font-bold rounded-2xl text-lg bg-white/5 backdrop-blur-sm transform active:scale-95 transition-all" style={{ color: 'var(--color-text)', border: '1px solid var(--color-border)' }} onClick={() => modals.setLoginOpen(true)}>
                Já tenho conta
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-4">
              {[
                { icon: '🤖', title: 'IA Generativa', desc: 'Perguntas únicas e desafiadoras.' },
                { icon: '📱', title: 'Mobile First', desc: 'Interface otimizada para o seu celular.' },
              ].map(f => (
                <div key={f.title} className="p-5 rounded-2xl flex gap-4 items-center bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/5">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>{f.title}</h3>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Mobile Header Stats Card */}
            <div className="relative overflow-hidden p-4 sm:p-5 rounded-[2rem] shadow-2xl isolate" style={{ backgroundColor: 'var(--color-surface)' }}>
              {/* Absolute border to prevent rendering artifacts */}
              <div className="absolute inset-0 rounded-[2rem] border border-white/10 pointer-events-none z-10" />
              
              <div className="flex items-center justify-between relative z-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                    {gameState?.avatarUrl ? (
                      <img src={gameState.avatarUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <span className="text-xl">🧑‍⚖️</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-60" style={{ color: 'var(--color-text-muted)' }}>Nível {gs.level}</p>
                    <p className="font-black text-lg leading-none mt-1" style={{ color: 'var(--color-text)' }}>{gameState?.nickname || 'Estudante'}</p>
                  </div>
                </div>

                {isTimerRunning && (
                  <div className="flex flex-col items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                    <p className="text-[9px] uppercase font-black tracking-widest opacity-60" style={{ color: 'var(--color-text-muted)' }}>Tempo</p>
                    <p className={`font-black text-base tabular-nums ${timeLeft < 30 ? 'text-red-500 animate-pulse' : ''}`} style={timeLeft >= 30 ? { color: 'var(--color-accent)' } : {}}>
                      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </p>
                  </div>
                )}

                <div className="text-right">
                  <p className="text-[9px] uppercase font-black tracking-widest opacity-80" style={{ color: 'var(--color-accent)' }}>Pontos</p>
                  <p className="font-black text-2xl leading-none mt-1" style={{ color: 'var(--color-text)' }}>{gs.score}</p>
                </div>
              </div>
            </div>

            {/* Subject Picker Row */}
            <div className="space-y-2">
              <SubjectPicker subject={subject} setSubject={setSubject} />
            </div>

            {/* Main Action Button */}
            <div className="flex gap-3 sticky bottom-4 z-50 mt-2">
              {!showNextLvl ? (
                <button
                  id="generate-btn"
                  className="flex-1 py-5 font-black rounded-[1.5rem] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }}
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current/20 border-t-current rounded-full animate-spin" />
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Iniciar Nível {gs.level}</span>
                    </>
                  )}
                </button>
              ) : (
                <button className="flex-1 py-5 bg-emerald-500 text-white font-black rounded-[1.5rem] shadow-2xl animate-pulse active:scale-95 transition-all flex items-center justify-center gap-2" onClick={handleNextLevel}>
                  <span>🎯</span>
                  <span>Próximo Nível</span>
                </button>
              )}
              <button 
                className="px-6 py-5 font-bold rounded-[1.5rem] shadow-lg active:scale-95 transition-all" 
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }} 
                onClick={handleReset}
              >
                Reset
              </button>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in zoom-in duration-300">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
                </div>
                <p className="font-black text-sm uppercase tracking-widest animate-pulse" style={{ color: 'var(--color-text-muted)' }}>Invocando IA...</p>
              </div>
            )}

            {feedback.msg && (
              <div className="p-4 rounded-2xl text-xs font-black text-center uppercase tracking-wider animate-in shake duration-500" style={{ backgroundColor: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.2)', color: 'var(--color-wrong)' }}>
                ⚠️ {feedback.msg}
              </div>
            )}

            {!gameVisible && !isLoading && (
              <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <DonationSection />
              </div>
            )}

            {/* Game Board Section */}
            {gameVisible && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex justify-between items-center px-2">
                   <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                     <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Corações:</span>
                     <span className="text-sm tracking-tighter filter drop-shadow-sm">{renderHearts()}</span>
                   </div>
                   <div className="px-2 py-1 rounded-md bg-white/5 text-[9px] font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--color-text-muted)' }}>
                     Fase {gs.level}
                   </div>
                </div>
                
                <div id="crossword-grid" className="w-full rounded-[2rem] p-2 shadow-2xl relative isolate" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="absolute inset-0 rounded-[2rem] border border-white/10 pointer-events-none z-10" />
                  <CrosswordBoard placedWords={placedWords} onSolved={handleSolved} />
                </div>

                {/* Game Controls */}
                <div className="grid grid-cols-3 gap-3">
                  <button id="hint-btn" className="flex flex-col items-center gap-1.5 p-4 rounded-2xl active:scale-90 transition-all bg-white/5 border border-white/10 shadow-lg" onClick={handleHint}>
                    <span className="text-2xl">💡</span>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Dica</span>
                  </button>
                  <button className="flex flex-col items-center gap-1.5 p-4 rounded-2xl active:scale-90 transition-all bg-white/5 border border-white/10 shadow-lg" onClick={handleClear}>
                    <span className="text-2xl">🗑️</span>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Limpar</span>
                  </button>
                  <button className="flex flex-col items-center gap-1.5 p-4 rounded-2xl active:scale-90 transition-all bg-red-500/10 border border-red-500/20 shadow-lg" onClick={handleRevealAll}>
                    <span className="text-2xl">👁️</span>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-wrong)' }}>Revelar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
