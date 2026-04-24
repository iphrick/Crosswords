import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    id: 'step-subject',
    targetId: 'subject-select',
    title: '📚 Escolha sua Matéria',
    text: 'Selecione o tema jurídico que você deseja estudar hoje.',
    position: 'bottom'
  },
  {
    id: 'step-generate',
    targetId: 'generate-btn',
    title: '🚀 Gerar Cruzadinha',
    text: 'Clique aqui para criar um novo desafio personalizado para você.',
    position: 'bottom'
  },
  {
    id: 'step-board',
    targetId: 'crossword-grid',
    title: '✏️ Hora de Jogar',
    text: 'Clique em uma célula para ver a pergunta e digite a resposta.',
    position: 'top'
  },
  {
    id: 'step-hint',
    targetId: 'hint-btn',
    title: '❤️ Use com Sabedoria',
    text: 'Se travar, use um coração para revelar uma letra. Mas cuidado, eles são limitados!',
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
        // Scroll into view if needed
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep, step.targetId]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('juriquest_tutorial_done', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('juriquest_tutorial_done', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Background Dimming with Hole */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-950/70"
        style={{
          clipPath: `polygon(
            0% 0%, 0% 100%, 
            ${coords.left}px 100%, 
            ${coords.left}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top + coords.height}px, 
            ${coords.left}px ${coords.top + coords.height}px, 
            ${coords.left}px 100%, 
            100% 100%, 100% 0%
          )`
        }}
      />

      {/* Tutorial Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20 }}
          className="absolute pointer-events-auto w-[320px] sm:w-[380px] bg-slate-900 border border-[#c9a96e]/40 rounded-2xl p-8 shadow-2xl shadow-black/60"
          style={{
            // Smart positioning: if too close to top, force to bottom
            top: (step.position === 'bottom' || coords.top < 250) 
              ? coords.top + coords.height + 25 
              : coords.top - 240,
            left: Math.max(15, Math.min(window.innerWidth - 335, coords.left + coords.width / 2 - 190)),
            // Ensure it doesn't hit the very top
            marginTop: 0
          }}
        >
          {/* Progress Dots */}
          <div className="flex gap-2 mb-5">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-[#c9a96e]' : 'w-2 bg-slate-800'}`}
              />
            ))}
          </div>

          <h4 className="text-white font-bold text-xl mb-3">{step.title}</h4>
          <p className="text-slate-400 text-base leading-relaxed mb-8">{step.text}</p>

          <div className="flex items-center justify-between gap-6">
            <button 
              onClick={handleSkip}
              className="text-xs font-bold text-slate-500 hover:text-[#c9a96e] transition-colors"
            >
              Pular Tudo
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-2.5 bg-[#c9a96e] text-slate-950 text-sm font-black rounded-xl hover:bg-[#d4b47a] transition-all transform active:scale-95 shadow-lg shadow-[#c9a96e]/20"
            >
              {currentStep === STEPS.length - 1 ? 'Começar!' : 'Próximo →'}
            </button>
          </div>

          {/* Arrow */}
          <div 
            className={`absolute w-5 h-5 bg-slate-900 border-l border-t border-[#c9a96e]/40 rotate-45 
              ${(step.position === 'bottom' || coords.top < 250) 
                ? '-top-2.5 left-1/2 -translate-x-1/2' 
                : '-bottom-2.5 left-1/2 -translate-x-1/2 border-r border-b border-l-0 border-t-0'
              }`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
