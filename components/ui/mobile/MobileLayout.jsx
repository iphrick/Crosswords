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

      <main className="flex-1 flex flex-col p-4 pb-32">
        {!user ? (
          <div className="flex flex-col gap-8 pt-10">
            <h1 className="text-4xl font-black leading-tight" style={{ color: 'var(--color-text)' }}>
              Domine o Direito <span style={{ color: 'var(--color-accent)' }}>jogando.</span>
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-lg">
              Cruzadinhas jurídicas geradas por IA. Treine onde quiser.
            </p>
            <div className="flex flex-col gap-4">
              <button className="w-full py-5 font-black rounded-2xl text-lg shadow-xl" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }} onClick={() => modals.setRegisterOpen(true)}>
                Começar Grátis
              </button>
              <button className="w-full py-5 font-bold rounded-2xl text-lg" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }} onClick={() => modals.setLoginOpen(true)}>
                Já tenho conta
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-8">
              {[
                { icon: '🤖', title: 'IA Generativa', desc: 'Perguntas únicas do Gemini.' },
                { icon: '📱', title: 'Mobile First', desc: 'Interface 100% otimizada.' },
              ].map(f => (
                <div key={f.title} className="p-6 rounded-2xl flex gap-4 items-center" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <span className="text-3xl">{f.icon}</span>
                  <div>
                    <h3 className="font-bold" style={{ color: 'var(--color-text)' }}>{f.title}</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Mobile Header Stats */}
            <div className="flex items-center justify-between p-4 rounded-2xl shadow-lg" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  <span className="text-xl">🧑‍⚖️</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Nível {gs.level}</p>
                  <p className="font-bold" style={{ color: 'var(--color-text)' }}>{gameState?.nickname || 'Estudante'}</p>
                </div>
              </div>

              {isTimerRunning && (
                <div className="flex flex-col items-center">
                  <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Tempo</p>
                  <p className={`font-black text-lg tabular-nums ${timeLeft < 30 ? 'text-red-500 animate-pulse' : ''}`} style={timeLeft >= 30 ? { color: 'var(--color-accent)' } : {}}>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </p>
                </div>
              )}

              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--color-correct)' }}>Pontos</p>
                <p className="font-black text-xl" style={{ color: 'var(--color-text)' }}>{gs.score}</p>
              </div>
            </div>

            {/* Subject Picker */}
            <SubjectPicker subject={subject} setSubject={setSubject} />

            {/* Actions */}
            <div className="flex gap-3">
              {!showNextLvl ? (
                <button
                  id="generate-btn"
                  className="flex-1 py-4 font-black rounded-2xl shadow-lg active:scale-95 transition-transform"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }}
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? 'Gerando…' : `Iniciar Nível ${gs.level}`}
                </button>
              ) : (
                <button className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-lg animate-pulse" onClick={handleNextLevel}>
                  Próximo Nível →
                </button>
              )}
              <button className="px-6 py-4 font-bold rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }} onClick={handleReset}>
                Reset
              </button>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center gap-4 py-10">
                <div className="w-12 h-12 rounded-full animate-spin" style={{ borderWidth: '4px', borderColor: 'var(--color-accent-dim)', borderTopColor: 'var(--color-accent)' }} />
                <p className="font-bold animate-pulse" style={{ color: 'var(--color-text-muted)' }}>Invocando Inteligência Artificial...</p>
              </div>
            )}

            {feedback.msg && (
              <div className="p-4 rounded-xl text-sm font-medium text-center" style={{ backgroundColor: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.2)', color: 'var(--color-wrong)' }}>
                {feedback.msg}
              </div>
            )}

            {!gameVisible && <DonationSection />}

            {/* Game Board */}
            {gameVisible && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center px-1">
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>DICAS:</span>
                     <span className="text-lg tracking-tighter">{renderHearts()}</span>
                   </div>
                   <button onClick={handleAdminSeed} className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>v{gs.level}.0</button>
                </div>
                
                <div id="crossword-grid" className="w-full rounded-3xl p-2" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <CrosswordBoard placedWords={placedWords} onSolved={handleSolved} />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-2">
                  <button id="hint-btn" className="flex flex-col items-center gap-1 p-4 rounded-2xl active:opacity-80" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }} onClick={handleHint}>
                    <span className="text-xl">💡</span>
                    <span className="text-[10px] font-black uppercase" style={{ color: 'var(--color-text-muted)' }}>Dica</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-4 rounded-2xl active:opacity-80" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }} onClick={handleClear}>
                    <span className="text-xl">🗑️</span>
                    <span className="text-[10px] font-black uppercase" style={{ color: 'var(--color-text-muted)' }}>Limpar</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-4 rounded-2xl active:opacity-80" style={{ backgroundColor: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)' }} onClick={handleRevealAll}>
                    <span className="text-xl">👁️</span>
                    <span className="text-[10px] font-black uppercase" style={{ color: 'var(--color-wrong)' }}>Revelar</span>
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
