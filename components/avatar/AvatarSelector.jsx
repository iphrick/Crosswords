import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AVATARS } from '@/lib/avatars';
import styles from '../auth/Modal.module.css';
import { User, UserPlus, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AvatarSelector({ visible, onClose }) {
  const { gameState, updateGameState } = useAuth();
  const [gender, setGender] = useState('feminino');
  const [index, setIndex] = useState(0);

  const filteredAvatars = AVATARS.filter(a => a.gender === gender);

  useEffect(() => {
    // Try to find current avatar in the filtered list
    const foundIdx = filteredAvatars.findIndex(a => a.id === gameState?.avatarId);
    if (foundIdx !== -1) setIndex(foundIdx);
    else setIndex(0);
  }, [gender, visible, gameState?.avatarId]);

  if (!visible) return null;

  const handleNext = () => setIndex((prev) => (prev + 1) % filteredAvatars.length);
  const handlePrev = () => setIndex((prev) => (prev - 1 + filteredAvatars.length) % filteredAvatars.length);

  const handleSelect = () => {
    const avatar = filteredAvatars[index];
    updateGameState(prev => {
      prev.avatarId = avatar.id;
      prev.avatarUrl = avatar.image;
      prev.profession = avatar.title;
    });
    setTimeout(onClose, 400);
  };

  const currentAvatarId = gameState?.avatarId;

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div 
        className={`${styles.modal} bg-slate-950 border border-slate-800 flex flex-col w-[95%] max-w-[1000px] h-fit md:h-[750px] overflow-hidden rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)]`} 
        role="dialog" 
        aria-modal="true"
      >
        <button className={styles.close} onClick={onClose} aria-label="Fechar">×</button>
        
        <div className="flex-1 flex flex-col p-6 sm:p-10">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">Identidade Jurídica</h2>
            <p className="text-slate-500 text-base">Deslize para escolher a face da sua carreira</p>
          </div>

          {/* Gender Switcher */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="bg-slate-900/80 p-1.5 rounded-2xl flex gap-1 border border-slate-800 shadow-inner">
              <button 
                onClick={() => setGender('feminino')}
                className={`flex items-center gap-3 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  gender === 'feminino' 
                    ? 'bg-[#c9a96e] text-slate-950 shadow-xl scale-105' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <User size={18} /> Feminino
              </button>
              <button 
                onClick={() => setGender('masculino')}
                className={`flex items-center gap-3 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  gender === 'masculino' 
                    ? 'bg-[#c9a96e] text-slate-950 shadow-xl scale-105' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <UserPlus size={18} /> Masculino
              </button>
            </div>
          </div>

          {/* Roulette Carousel */}
          <div className="flex-1 relative flex items-center justify-center overflow-visible">
            {/* Nav Buttons */}
            <button 
              onClick={handlePrev}
              className="absolute left-0 sm:-left-4 z-30 p-4 bg-slate-900/80 hover:bg-[#c9a96e] text-white hover:text-slate-950 rounded-full border border-slate-800 transition-all active:scale-90"
            >
              <ChevronLeft size={32} strokeWidth={3} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-0 sm:-right-4 z-30 p-4 bg-slate-900/80 hover:bg-[#c9a96e] text-white hover:text-slate-950 rounded-full border border-slate-800 transition-all active:scale-90"
            >
              <ChevronRight size={32} strokeWidth={3} />
            </button>

            {/* Avatar Track */}
            <div className="w-full h-full flex items-center justify-center perspective-1000">
              <AnimatePresence mode="popLayout">
                <div className="flex items-center justify-center gap-4 sm:gap-10">
                   {[-1, 0, 1].map((offset) => {
                     const itemIndex = (index + offset + filteredAvatars.length) % filteredAvatars.length;
                     const avatar = filteredAvatars[itemIndex];
                     const isActive = offset === 0;

                     return (
                       <motion.div
                         key={`${gender}-${avatar.id}-${offset}`}
                         initial={{ opacity: 0, scale: 0.5, x: offset * 100 }}
                         animate={{ 
                           opacity: isActive ? 1 : 0.3, 
                           scale: isActive ? 1.2 : 0.8,
                           x: 0,
                           zIndex: isActive ? 20 : 10,
                           filter: isActive ? 'blur(0px)' : 'blur(2px)'
                         }}
                         exit={{ opacity: 0, scale: 0.5 }}
                         transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                         onClick={() => { if (!isActive) setIndex(itemIndex); }}
                         className={`relative cursor-pointer rounded-3xl overflow-hidden border-2 shadow-2xl transition-all duration-500 ${
                           isActive ? 'border-[#c9a96e] shadow-[#c9a96e]/20' : 'border-slate-800 hover:border-slate-700'
                         } ${isActive ? 'w-[200px] sm:w-[280px]' : 'hidden sm:block w-[140px] sm:w-[200px]'} aspect-[2/3]`}
                       >
                         <img 
                           src={avatar.image} 
                           alt={avatar.title}
                           className="w-full h-full object-cover"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                         
                         <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                            <h4 className={`text-white font-black uppercase tracking-tighter ${isActive ? 'text-lg sm:text-2xl' : 'text-xs sm:text-sm'}`}>
                              {avatar.title}
                            </h4>
                            {isActive && (
                              <p className="text-[#c9a96e] text-[10px] sm:text-xs font-bold tracking-widest mt-1 opacity-80 uppercase">
                                {avatar.description}
                              </p>
                            )}
                         </div>

                         {currentAvatarId === avatar.id && isActive && (
                           <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                             <Check size={20} strokeWidth={4} />
                           </div>
                         )}
                       </motion.div>
                     );
                   })}
                </div>
              </AnimatePresence>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="mt-12 sm:mt-16 text-center">
            <button 
              onClick={handleSelect}
              className="px-12 py-5 bg-[#c9a96e] text-slate-950 font-black rounded-2xl text-xl shadow-[0_10px_40px_rgba(201,169,110,0.3)] hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
            >
              {currentAvatarId === filteredAvatars[index]?.id ? 'Manter Identidade' : 'Assumir Cargo'}
            </button>
            <p className="mt-6 text-slate-600 text-xs font-bold uppercase tracking-widest">Mais estilos em breve</p>
          </div>
        </div>
      </div>
    </div>
  );
}
