import React from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
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
  feedback
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      <Header
        onLoginClick={modals.setLoginOpen}
        onRegisterClick={modals.setRegisterOpen}
        onRankingClick={modals.setRankingOpen}
        onContactClick={modals.setContactOpen}
        onAvatarClick={modals.setAvatarOpen}
        onTutorialClick={modals.setTutorialOpen}
      />

      <main className="flex-1 flex flex-col p-4 pb-32">
        {!user ? (
          <div className="flex flex-col gap-8 pt-10">
            <h1 className="text-4xl font-black text-white leading-tight">
              Domine o Direito <span className="text-[#c9a96e]">jogando.</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Cruzadinhas jurídicas geradas por IA. Treine onde quiser.
            </p>
            <div className="flex flex-col gap-4">
              <button className="w-full py-5 bg-[#c9a96e] text-slate-950 font-black rounded-2xl text-lg shadow-xl" onClick={() => modals.setRegisterOpen(true)}>
                Começar Grátis
              </button>
              <button className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl text-lg border border-slate-800" onClick={() => modals.setLoginOpen(true)}>
                Já tenho conta
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-8">
              {[
                { icon: '🤖', title: 'IA Generativa', desc: 'Perguntas únicas do Gemini.' },
                { icon: '📱', title: 'Mobile First', desc: 'Interface 100% otimizada.' },
              ].map(f => (
                <div key={f.title} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 flex gap-4 items-center">
                  <span className="text-3xl">{f.icon}</span>
                  <div>
                    <h3 className="font-bold text-white">{f.title}</h3>
                    <p className="text-sm text-slate-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Mobile Header Stats */}
            <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                  <img src={gameState?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Nível {gs.level}</p>
                  <p className="text-white font-bold">{gameState?.nickname || 'Estudante'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest">Pontos</p>
                <p className="text-white font-black text-xl">{gs.score}</p>
              </div>
            </div>

            {/* Subject Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Matéria Atual</label>
              <select
                id="subject-select"
                className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 text-white font-bold appearance-none focus:border-[#c9a96e] outline-none transition-all"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              >
                {modals.SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {!showNextLvl ? (
                <button
                  id="generate-btn"
                  className="flex-1 py-4 bg-[#c9a96e] text-slate-950 font-black rounded-2xl shadow-lg active:scale-95 transition-transform"
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
              <button className="px-6 py-4 bg-slate-900 text-slate-400 font-bold rounded-2xl border border-slate-800" onClick={handleReset}>
                Reset
              </button>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center gap-4 py-10">
                <div className="w-12 h-12 border-4 border-[#c9a96e]/20 border-t-[#c9a96e] rounded-full animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse">Invocando Inteligência Artificial...</p>
              </div>
            )}

            {feedback.msg && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm font-medium text-center">
                {feedback.msg}
              </div>
            )}

            {/* Game Board */}
            {gameVisible && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center px-1">
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-slate-500">DICAS:</span>
                     <span className="text-lg tracking-tighter">{renderHearts()}</span>
                   </div>
                   <button onClick={handleAdminSeed} className="text-[10px] text-slate-600">v{gs.level}.0</button>
                </div>
                
                <div id="crossword-grid" className="w-full bg-slate-900/30 rounded-3xl p-2 border border-slate-800/50">
                  <CrosswordBoard placedWords={placedWords} onSolved={handleSolved} />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-2">
                  <button id="hint-btn" className="flex flex-col items-center gap-1 p-4 bg-slate-900 rounded-2xl border border-slate-800 active:bg-slate-800" onClick={handleHint}>
                    <span className="text-xl">💡</span>
                    <span className="text-[10px] font-black uppercase text-slate-400">Dica</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-4 bg-slate-900 rounded-2xl border border-slate-800 active:bg-slate-800" onClick={handleClear}>
                    <span className="text-xl">🗑️</span>
                    <span className="text-[10px] font-black uppercase text-slate-400">Limpar</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-4 bg-red-950/20 rounded-2xl border border-red-900/30 active:bg-red-900/40" onClick={handleRevealAll}>
                    <span className="text-xl">👁️</span>
                    <span className="text-[10px] font-black uppercase text-red-400">Revelar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
