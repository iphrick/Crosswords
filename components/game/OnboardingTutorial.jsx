import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    id: 'step-menu',
    targetId: 'tutorial-btn',
    title: '🏆 Navegação Principal',
    text: 'Acesse o Ranking Global, as Instruções completas ou entre em contato conosco por aqui.',
  },
  {
    id: 'step-subject',
    targetId: 'subject-select',
    title: '📚 Escolha sua Matéria',
    text: 'Selecione o tema jurídico que você deseja dominar. Temos Direito Constitucional, Penal, Civil e mais!',
  },
  {
    id: 'step-stats',
    targetId: 'generate-btn',
    title: '📊 Seu Progresso',
    text: 'Acompanhe seu nível atual e sua pontuação total. Quanto mais você joga, mais alto sobe no Ranking!',
  },
  {
    id: 'step-generate',
    targetId: 'generate-btn',
    title: '🚀 Inicie o Desafio',
    text: 'Clique aqui para gerar uma nova cruzadinha. A IA criará perguntas exclusivas baseadas na matéria escolhida.',
  },
  {
    id: 'step-board',
    targetId: 'crossword-grid',
    title: '✏️ O Tabuleiro',
    text: 'Clique em qualquer célula para focar. A pergunta aparecerá em um balão flutuante acima da palavra.',
  },
  {
    id: 'step-hint',
    targetId: 'hint-btn',
    title: '❤️ Sistema de Dicas',
    text: 'Se travar em uma questão, use seus corações para revelar uma letra. Use com estratégia!',
  }
];

export default function OnboardingTutorial({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0, arrowUp: false });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const cardRef = useRef(null);

  const step = STEPS[currentStep];

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    const updatePosition = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        const arrowUp = rect.top < 350;
        
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
          arrowUp
        });
        
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        if (currentStep < STEPS.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          onComplete();
        }
      }
    };

    const timer = setTimeout(updatePosition, 150);
    window.addEventListener('resize', () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      updatePosition();
    });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, [currentStep, step.targetId]);

  const handleNext = () => {
    console.log('[Tutorial Debug] Indo para o próximo passo:', currentStep + 1);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('[Tutorial Debug] Tutorial concluído com sucesso.');
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
    console.log('[Tutorial Debug] Tutorial ignorado pelo usuário.');
    localStorage.setItem('juriquest_tutorial_done', 'true');
    onComplete();
  };

  // Cálculo de posição responsiva do card
  const getCardStyle = () => {
    const isMobile = windowSize.width < 640;
    const cardWidth = isMobile ? Math.min(windowSize.width - 40, 340) : 420;
    
    let top = coords.arrowUp 
      ? coords.top + coords.height + 25 
      : coords.top - (isMobile ? 220 : 280);
      
    let left = coords.left + coords.width / 2 - cardWidth / 2;
    
    // Viewport bounds
    const margin = 20;
    if (left < margin) left = margin;
    if (left + cardWidth > windowSize.width - margin) left = windowSize.width - cardWidth - margin;

    return { top, left, width: cardWidth };
  };

  const cardStyle = getCardStyle();

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden">
      {/* Overlay com clip-path dinâmico */}
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

      <motion.div
        animate={{
          top: coords.top - 8,
          left: coords.left - 8,
          width: coords.width + 16,
          height: coords.height + 16,
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute border-2 border-[#c9a96e] rounded-xl shadow-[0_0_30px_rgba(201,169,110,0.4)] z-[10001]"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          ref={cardRef}
          initial={{ opacity: 0, y: coords.arrowUp ? 20 : -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: coords.arrowUp ? 20 : -20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 240 }}
          className="absolute pointer-events-auto bg-slate-900 border border-[#c9a96e]/20 rounded-[2rem] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.9)] z-[10002] flex flex-col gap-4"
          style={{
            top: cardStyle.top,
            left: cardStyle.left,
            width: cardStyle.width,
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
        >
          {/* Header & Progress Bar */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#c9a96e] uppercase tracking-[0.25em]">
                {currentStep + 1} / {STEPS.length}
              </span>
              <button onClick={handleSkip} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors p-1">
                Pular
              </button>
            </div>
            <div className="flex gap-1.5 h-1">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-full rounded-full flex-1 transition-all duration-500 ${i <= currentStep ? 'bg-[#c9a96e]' : 'bg-slate-800'}`} />
              ))}
            </div>
          </div>

          <div className="space-y-2 mt-2">
            <h4 className="text-white font-black text-lg sm:text-xl leading-tight break-words">{step.title}</h4>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed break-words overflow-wrap-anywhere">{step.text}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
            <div className="flex gap-2 order-2 sm:order-1">
              {currentStep > 0 && (
                <button 
                  onClick={handleBack}
                  className="px-5 py-3 bg-slate-800/50 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 transition-all border border-slate-700/30 flex-1 sm:flex-none"
                >
                  ← Voltar
                </button>
              )}
            </div>
            
            <button
              onClick={handleNext}
              className="px-8 py-4 bg-[#c9a96e] text-slate-950 text-sm font-black rounded-xl hover:bg-[#d4b47a] transition-all transform active:scale-95 shadow-xl shadow-[#c9a96e]/10 order-1 sm:order-2 flex-1 sm:flex-none text-center"
            >
              {currentStep === STEPS.length - 1 ? 'Vamos Jogar! 🚀' : 'Próximo Passo'}
            </button>
          </div>

          {/* Arrow */}
          <div 
            className={`absolute w-6 h-6 bg-slate-900 border-l border-t border-[#c9a96e]/20 rotate-45 pointer-events-none
              ${coords.arrowUp 
                ? '-top-3 left-1/2 -translate-x-1/2' 
                : '-bottom-3 left-1/2 -translate-x-1/2 border-r border-b border-l-0 border-t-0'
              }`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
