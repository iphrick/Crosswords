import React, { useState } from 'react';
import { Copy, Check, Heart } from 'lucide-react';

export default function DonationSection() {
  const [copied, setCopied] = useState(false);
  const pixKey = "00020126580014br.gov.bcb.pix0136012437e8-14de-43c8-85a3-c1cbb940a3755204000053039865802BR5925PEDRO HENRIQUE CLEMENTINO6009Sao Paulo62290525REC69E64BB02C3E719732270963040B47";

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex justify-center mt-12 mb-16 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="w-full max-w-5xl relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl bg-slate-900/40 backdrop-blur-md p-8 sm:p-12 md:p-16 text-center">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-50" />
        
        <div className="flex flex-col items-center gap-10 sm:gap-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-inner">
            <Heart size={36} fill="currentColor" className="animate-pulse" />
          </div>
          
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]" style={{ color: 'var(--color-text)' }}>
              Apoie o projeto, <span className="text-emerald-400">sua ajuda</span> nos motiva a melhorar
            </h2>
            <p className="text-base sm:text-xl text-slate-400 font-medium leading-relaxed mt-2">
              O JuriQuest é gratuito e independente. Contribua para mantermos o projeto ativo e em constante evolução.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 sm:gap-20 mt-6 w-full">
            {/* QR Code Container */}
            <div className="flex flex-col items-center gap-6">
              <div className="p-6 sm:p-8 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform hover:scale-[1.02] transition-all duration-300">
                <img 
                  src="/img-pix.jpeg" 
                  alt="QR Code Pix" 
                  className="w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 object-contain rounded-2xl"
                />
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-black uppercase tracking-[0.3em]">Escaneie para doar</p>
            </div>

            {/* Copy & Paste Container */}
            <div className="w-full max-w-md flex flex-col items-center lg:items-start gap-8">
              <div className="text-center lg:text-left space-y-3">
                <p className="text-xs sm:text-sm font-black text-slate-500 uppercase tracking-[0.25em]">Chave Copia e Cola</p>
                <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
                  Use este código no seu aplicativo do banco para realizar o pagamento via Pix.
                </p>
              </div>

              <div 
                onClick={handleCopy}
                className="w-full group relative flex items-center justify-between bg-slate-950/60 border border-white/10 rounded-2xl p-2 pl-6 cursor-pointer hover:border-emerald-500/50 active:scale-[0.98] transition-all shadow-2xl overflow-hidden"
              >
                <div className="flex-1 overflow-hidden">
                  <code className="text-emerald-400 font-mono text-base sm:text-lg font-bold block truncate pr-4">
                    {pixKey}
                  </code>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500 text-slate-950 h-12 px-6 rounded-xl font-black text-xs uppercase shadow-lg transform group-hover:bg-emerald-400 transition-all">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Pronto!' : 'Copiar'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-950/40 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-xs sm:text-sm text-slate-400 font-bold">
                  Favorecido: <span className="text-slate-200">Pedro Henrique Clementino</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
