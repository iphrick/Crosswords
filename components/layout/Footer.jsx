import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full pt-12 pb-20 mt-auto border-t border-slate-800 bg-slate-950/50 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Visual Keyboard Sketch */}
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="px-3 py-2 bg-slate-800 border-b-4 border-slate-900 rounded-lg text-[#c9a96e] font-black text-xs shadow-lg">TAB</div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Próxima Palavra</span>
            </div>
            
            <div className="h-12 w-[1px] bg-slate-800 mx-2 hidden md:block" />

            <div className="flex flex-col items-center gap-1">
              <div className="grid grid-cols-3 gap-1">
                <div />
                <div className="w-8 h-8 flex items-center justify-center bg-slate-800 border-b-4 border-slate-900 rounded text-[#c9a96e] text-sm">↑</div>
                <div />
                <div className="w-8 h-8 flex items-center justify-center bg-slate-800 border-b-4 border-slate-900 rounded text-[#c9a96e] text-sm">←</div>
                <div className="w-8 h-8 flex items-center justify-center bg-slate-800 border-b-4 border-slate-900 rounded text-[#c9a96e] text-sm">↓</div>
                <div className="w-8 h-8 flex items-center justify-center bg-slate-800 border-b-4 border-slate-900 rounded text-[#c9a96e] text-sm">→</div>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Mover Célula</span>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Dica de Navegação</p>
            <p className="text-slate-300 text-sm font-medium text-center md:text-left leading-relaxed max-w-xs">
              Utilize as <span className="text-[#c9a96e] font-bold">teclas de seta</span> para navegar entre as células e <span className="text-[#c9a96e] font-bold">TAB</span> para saltar entre as perguntas.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} JuriQuest — O Desafio Jurídico
          </div>
          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="text-emerald-500 text-[9px] font-black tracking-widest uppercase">Sistema IA Ativo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
