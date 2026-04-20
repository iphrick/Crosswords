// components/game/CharacterCreator.jsx
import { useAuth } from '@/context/AuthContext';
import styles from '../auth/Modal.module.css';
import AvatarCreatorUI from '../avatar/AvatarCreatorUI';

export default function CharacterCreator({ visible, onClose }) {
  const { gameState, updateGameState } = useAuth();

  if (!visible) return null;

  // Calcula o maior nível atingido pelo usuário
  let maxLevel = 1;
  if (gameState?.subjects) {
    for (const key in gameState.subjects) {
      if (gameState.subjects[key].level > maxLevel) {
        maxLevel = gameState.subjects[key].level;
      }
    }
  }

  // Prepara os dados iniciais do avatar baseados no Firestore
  const initialData = gameState?.avatar || {
    topType: 'ShortHairShortFlat',
    hairColor: 'BrownDark',
    facialHairType: 'Blank',
    skinColor: 'Light',
    background: 'minimal',
    customClothe: 'None',
    customAccessory: 'None'
  };

  const handleSave = async (avatarData) => {
    try {
      await updateGameState(gs => {
        gs.avatar = avatarData;
      });
      onClose();
    } catch (err) {
      console.error("Erro ao salvar avatar", err);
    }
  };

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* O AvatarCreatorUI já cuida do layout interno do modal, só precisamos garantir o tamanho externo */}
      <div className="w-full max-w-4xl animate-[slideUp_0.3s_ease] shadow-2xl relative" role="dialog" aria-modal="true">
        <button 
          className="absolute -top-10 right-0 text-white hover:text-amber-400 text-3xl z-50 transition-colors" 
          onClick={onClose} 
          aria-label="Fechar"
        >
          &times;
        </button>
        <AvatarCreatorUI 
          initialData={initialData} 
          maxLevel={maxLevel} 
          onSave={handleSave} 
          onClose={onClose} 
        />
      </div>
    </div>
  );
}
