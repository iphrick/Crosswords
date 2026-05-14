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
          <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Mobile Header Stats Card - Grounded & Premium */}
            <section 
              className="relative overflow-hidden p-6 rounded-[2rem] shadow-2xl flex flex-col gap-6 isolate" 
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden" style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                    {gameState?.avatarUrl ? (
                      <img src={gameState.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🧑‍⚖️</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-60" style={{ color: 'var(--color-text-muted)' }}>Identidade</p>
                    <p className="font-black text-xl leading-none mt-1" style={{ color: 'var(--color-text)' }}>{gameState?.nickname || 'Estudante'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-80" style={{ color: 'var(--color-accent)' }}>Pontos</p>
                  <p className="font-black text-3xl leading-none mt-1" style={{ color: 'var(--color-text)' }}>{gs.score}</p>
                </div>
              </div>

              {/* Grounded Stats Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[9px] uppercase font-black tracking-[0.2em] mb-1 opacity-60" style={{ color: 'var(--color-text-muted)' }}>Nível Atual</p>
                  <p className="text-xl font-black" style={{ color: 'var(--color-accent)' }}>{gs.level}</p>
                </div>
                {isTimerRunning ? (
                  <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-4 text-center">
                    <p className="text-[9px] uppercase font-black tracking-[0.2em] mb-1 opacity-60" style={{ color: 'var(--color-text-muted)' }}>Tempo</p>
                    <p className={`text-xl font-black tabular-nums ${timeLeft < 30 ? 'text-red-500 animate-pulse' : ''}`} style={timeLeft >= 30 ? { color: 'var(--color-accent)' } : {}}>
                      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </p>
                  </div>
                ) : (
                   <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-4 text-center flex items-center justify-center">
                     <p className="text-[9px] uppercase font-black tracking-[0.2em] opacity-30" style={{ color: 'var(--color-text-muted)' }}>Aguardando...</p>
                   </div>
                )}
              </div>
            </section>

            {/* Subject Picker Row */}
            <div className="px-1">
              <SubjectPicker subject={subject} setSubject={setSubject} />
            </div>

            {/* Main Action Button - Floating Premium Bar */}
            <div className="fixed bottom-6 left-4 right-4 z-[100] flex gap-3">
              {!showNextLvl ? (
                <button
                  id="generate-btn"
                  className="flex-1 h-16 font-black rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3 text-base border-t border-white/10"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }}
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><div className="w-5 h-5 border-2 border-current/20 border-t-current rounded-full animate-spin" /> Gerando...</>
                  ) : (
                    <>🚀 Gerar Nível {gs.level}</>
                  )}
                </button>
              ) : (
                <button className="flex-1 h-16 bg-emerald-600 text-white font-black rounded-2xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3 text-base border-t border-white/20" onClick={handleNextLevel}>
                  🎯 Próximo Nível
                </button>
              )}
              <button 
                className="w-20 h-16 flex items-center justify-center font-black rounded-2xl shadow-xl active:scale-95 transition-all" 
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }} 
                onClick={handleReset}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center gap-5 py-12 animate-in fade-in zoom-in duration-300">
                <div className="w-14 h-14 border-4 border-white/5 border-t-emerald-500 rounded-full animate-spin" />
                <p className="font-black text-xs uppercase tracking-[0.3em] animate-pulse" style={{ color: 'var(--color-text-muted)' }}>Gerando Cruzadinha...</p>
              </div>
            )}

            {feedback.msg && (
              <div className="p-5 rounded-2xl text-xs font-black text-center uppercase tracking-[0.15em] animate-in shake duration-500" style={{ backgroundColor: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.2)', color: 'var(--color-wrong)' }}>
                ⚠️ {feedback.msg}
              </div>
            )}

            {!gameVisible && !isLoading && (
              <div className="mt-4 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <DonationSection />
              </div>
            )}

            {/* Game Board Section */}
            {gameVisible && (
              <div className="flex flex-col gap-6 pb-28 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex justify-between items-center px-2">
                   <div className="flex items-center gap-3 bg-slate-950/30 px-4 py-2 rounded-xl border border-white/5">
                     <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>Corações:</span>
                     <span className="text-base tracking-tighter filter drop-shadow-sm leading-none">{renderHearts()}</span>
                   </div>
                   <div className="px-3 py-1.5 rounded-lg bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--color-text-muted)' }}>
                     Fase {gs.level}
                   </div>
                </div>
                
                <div id="crossword-grid" className="w-full rounded-[2.5rem] p-3 shadow-2xl relative isolate" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <CrosswordBoard placedWords={placedWords} onSolved={handleSolved} />
                </div>

                {/* Game Controls - Grounded Square Actions */}
                <div className="grid grid-cols-3 gap-4">
                  <button id="hint-btn" className="flex flex-col items-center justify-center gap-2 h-24 rounded-2xl active:scale-95 transition-all bg-white/5 border border-white/5 shadow-xl" onClick={handleHint}>
                    <span className="text-2xl">💡</span>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Dica</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 h-24 rounded-2xl active:scale-95 transition-all bg-white/5 border border-white/5 shadow-xl" onClick={handleClear}>
                    <span className="text-2xl">🗑️</span>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Limpar</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 h-24 rounded-2xl active:scale-95 transition-all bg-red-500/10 border border-red-500/20 shadow-xl" onClick={handleRevealAll}>
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
