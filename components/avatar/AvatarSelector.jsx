import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AVATARS } from '@/lib/avatars';
import styles from '../auth/Modal.module.css';
import { User, UserPlus, Check } from 'lucide-react';

export default function AvatarSelector({ visible, onClose }) {
  const { gameState, updateGameState } = useAuth();
  const [gender, setGender] = useState('feminino'); // 'feminino' or 'masculino'

  if (!visible) return null;

  const filteredAvatars = AVATARS.filter(a => a.gender === gender);
  const currentAvatarId = gameState?.avatarId;

  const handleSelect = (avatar) => {
    updateGameState(prev => {
      prev.avatarId = avatar.id;
      prev.avatarUrl = avatar.image;
      prev.profession = avatar.title;
    });
    // Optional: add a small delay or close immediately
    setTimeout(onClose, 300);
  };

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`${styles.modal} bg-slate-900 border border-slate-800 flex flex-col max-w-4xl w-[95%] max-h-[90vh]`} role="dialog" aria-modal="true">
        <button className={styles.close} onClick={onClose} aria-label="Fechar">×</button>
        
        <div className="p-6 overflow-y-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Identidade Jurídica</h2>
            <p className="text-slate-400 text-sm">Escolha sua profissão e personalize sua presença no JuriQuest</p>
          </div>

          {/* Gender Switcher */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-700">
              <button 
                onClick={() => setGender('feminino')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                  gender === 'feminino' 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User size={16} /> Feminino
              </button>
              <button 
                onClick={() => setGender('masculino')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                  gender === 'masculino' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus size={16} /> Masculino
              </button>
            </div>
          </div>

          {/* Avatar Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredAvatars.map((avatar) => (
              <div 
                key={avatar.id}
                onClick={() => handleSelect(avatar)}
                className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] ${
                  currentAvatarId === avatar.id 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                    : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                {/* Card Aspect Ratio (approx 2:3 like a trading card) */}
                <div className="aspect-[2/3] relative bg-slate-800">
                  {/* Placeholder for the generated image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                  <img 
                    src={avatar.image} 
                    alt={avatar.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/400x600/1e293b/ffffff?text=" + avatar.title;
                    }}
                  />
                  
                  {/* Selection Overlay */}
                  {currentAvatarId === avatar.id && (
                    <div className="absolute top-2 right-2 z-20 bg-emerald-500 text-white p-1 rounded-full shadow-lg animate-in zoom-in duration-300">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}

                  {/* Text Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-20 text-center">
                    <h4 className="text-white font-bold text-sm leading-tight mb-0.5">{avatar.title}</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{avatar.description}</p>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-center">
          <p className="text-xs text-slate-500">Mais profissões e estilos em breve!</p>
        </div>
      </div>
    </div>
  );
}
