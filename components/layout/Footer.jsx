import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-8 mt-auto border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Dica de Navegação</p>
          <p className="text-slate-300 text-sm font-medium">
            Para mover-se pelo tabuleiro, utilize a tecla <span className="text-[#c9a96e] font-bold">TAB</span> e as <span className="text-[#c9a96e] font-bold">teclas de seta</span> (← ↑ → ↓).
          </p>
        </div>
        
        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} JuriQuest — O Desafio Jurídico. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
