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
    <div className="w-full max-w-4xl mx-auto mt-12 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl bg-slate-900/40 backdrop-blur-md p-8 md:p-12 text-center">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-50" />
        
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-inner">
            <Heart size={32} fill="currentColor" className="animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>
              Apoie o projeto, <span className="text-emerald-400">sua ajuda</span> nos motiva a melhorar
            </h2>
            <p className="text-lg text-slate-400 font-medium">
              O JuriQuest é gratuito e independente. Contribua para mantermos os servidores e as atualizações.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10 mt-4 w-full justify-center">
            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <img 
                src="/img-pix.jpeg" 
                alt="QR Code Pix" 
                className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-xl"
              />
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Escaneie para doar</p>
            </div>

            {/* Copy & Paste Container */}
            <div className="flex-1 max-w-sm space-y-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-left md:text-center">Chave Copia e Cola</p>
              <div 
                onClick={handleCopy}
                className="group relative flex items-center justify-between bg-slate-950/50 border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-emerald-500/50 transition-all shadow-inner overflow-hidden"
              >
                <code className="text-emerald-400 font-mono text-lg font-bold truncate pr-4">
                  {pixKey}
                </code>
                <div className="flex items-center gap-2 bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl font-black text-xs uppercase shadow-lg transform group-hover:scale-105 transition-all">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium italic">
                Chave celular: {pixKey.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
