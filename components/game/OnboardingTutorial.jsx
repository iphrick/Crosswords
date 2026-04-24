import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    id: 'step-menu',
    targetId: 'tutorial-btn',
    title: '🏆 Navegação Principal',
    text: 'Acesse o Ranking Global, as Instruções completas ou entre em contato conosco por aqui.',
    position: 'bottom'
  },
  {
    id: 'step-subject',
    targetId: 'subject-select',
    title: '📚 Escolha sua Matéria',
    text: 'Selecione o tema jurídico que você deseja dominar. Temos Direito Constitucional, Penal, Civil e mais!',
    position: 'bottom'
  },
  {
    id: 'step-stats',
    targetId: 'generate-btn',
    title: '📊 Seu Progresso',
    text: 'Acompanhe seu nível atual e sua pontuação total. Quanto mais você joga, mais alto sobe no Ranking!',
    position: 'bottom'
  },
  {
    id: 'step-generate',
    targetId: 'generate-btn',
    title: '🚀 Inicie o Desafio',
    text: 'Clique aqui para gerar uma nova cruzadinha. A IA criará perguntas exclusivas baseadas na matéria escolhida.',
    position: 'bottom'
  },
  {
    id: 'step-board',
    targetId: 'crossword-grid',
    title: '✏️ O Tabuleiro',
    text: 'Clique em qualquer célula para focar. A pergunta aparecerá em um balão flutuante acima da palavra.',
    position: 'top'
  },
  {
    id: 'step-hint',
    targetId: 'hint-btn',
    title: '❤️ Sistema de Dicas',
    text: 'Se travar em uma questão, use seus corações para revelar uma letra. Use com estratégia!',
    position: 'top'
  }
];

export default function OnboardingTutorial({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const step = STEPS[currentStep];

  useEffect(() => {
    const updatePosition = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Se o elemento não existir (ex: jogo ainda não gerado), tenta o próximo ou encerra
        if (currentStep < STEPS.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          onComplete();
        }
      }
    };

    // Pequeno delay para garantir que o elemento esteja renderizado e posicionado
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, [currentStep, step.targetId]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('juriquest_tutorial_done', 'true');
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('juriquest_tutorial_done', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none">
      {/* Background Dimming with Hole */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-950/80"
        style={{
          clipPath: `polygon(
            0% 0%, 0% 100%, 
            ${coords.left - 8}px 100%, 
            ${coords.left - 8}px ${coords.top - 8}px, 
            ${coords.left + coords.width + 8}px ${coords.top - 8}px, 
            ${coords.left + coords.width + 8}px ${coords.top + coords.height + 8}px, 
            ${coords.left - 8}px ${coords.top + coords.height + 8}px, 
            ${coords.left - 8}px 100%, 
            100% 100%, 100% 0%
          )`
        }}
      />

      {/* Glowing Highlight Border */}
      <motion.div
        animate={{
          top: coords.top - 8,
          left: coords.left - 8,
          width: coords.width + 16,
          height: coords.height + 16,
          opacity: [0.4, 1, 0.4]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute border-2 border-[#c9a96e] rounded-xl shadow-[0_0_20px_rgba(201,169,110,0.5)] z-[10001]"
      />

      {/* Tutorial Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute pointer-events-auto w-[340px] sm:w-[420px] bg-slate-900 border border-[#c9a96e]/30 rounded-3xl p-8 shadow-2xl shadow-black/80 z-[10002]"
          style={{
            top: (coords.top < 300) 
              ? coords.top + coords.height + 40 
              : coords.top - 320,
            left: Math.max(20, Math.min(window.innerWidth - 440, coords.left + coords.width / 2 - 210)),
          }}
        >
          {/* Header & Progress */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-[#c9a96e] uppercase tracking-[0.2em]">
              Passo {currentStep + 1} de {STEPS.length}
            </span>
            <button onClick={handleSkip} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
              Pular Tudo
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-1.5 mb-8">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${i <= currentStep ? 'bg-[#c9a96e]' : 'bg-slate-800'}`}
              />
            ))}
          </div>

          <h4 className="text-white font-black text-2xl mb-4 leading-tight">{step.title}</h4>
          <p className="text-slate-400 text-base leading-relaxed mb-10">{step.text}</p>

          <div className="flex items-center justify-between gap-4">
            {currentStep > 0 ? (
              <button 
                onClick={handleBack}
                className="px-6 py-3 bg-slate-800 text-slate-300 text-sm font-bold rounded-2xl hover:bg-slate-700 transition-all border border-slate-700/50"
              >
                ← Voltar
              </button>
            ) : <div />}
            
            <button
              onClick={handleNext}
              className="px-10 py-4 bg-[#c9a96e] text-slate-950 text-sm font-black rounded-2xl hover:bg-[#d4b47a] transition-all transform active:scale-95 shadow-xl shadow-[#c9a96e]/20"
            >
              {currentStep === STEPS.length - 1 ? 'Vamos Jogar! 🚀' : 'Próximo Passo →'}
            </button>
          </div>

          {/* Arrow */}
          <div 
            className={`absolute w-6 h-6 bg-slate-900 border-l border-t border-[#c9a96e]/30 rotate-45 
              ${(coords.top < 300) 
                ? '-top-3 left-1/2 -translate-x-1/2' 
                : '-bottom-3 left-1/2 -translate-x-1/2 border-r border-b border-l-0 border-t-0'
              }`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
