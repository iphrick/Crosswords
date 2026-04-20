import React, { useState, useRef, useMemo } from 'react';
import { toPng } from 'html-to-image';
import JuridicalAvatar from './JuridicalAvatar';

// Opções do Avataaars
const topTypes = ['NoHair', 'Eyepatch', 'Hat', 'Hijab', 'Turban', 'WinterHat1', 'WinterHat2', 'WinterHat3', 'WinterHat4', 'LongHairBigHair', 'LongHairBob', 'LongHairBun', 'LongHairCurly', 'LongHairCurvy', 'LongHairDreads', 'LongHairFrida', 'LongHairFro', 'LongHairFroBand', 'LongHairNotTooLong', 'LongHairShavedSides', 'LongHairMiaWallace', 'LongHairStraight', 'LongHairStraight2', 'LongHairStraightStrand', 'ShortHairDreads01', 'ShortHairDreads02', 'ShortHairFrizzle', 'ShortHairShaggyMullet', 'ShortHairShortCurly', 'ShortHairShortFlat', 'ShortHairShortRound', 'ShortHairShortWaved', 'ShortHairSides', 'ShortHairTheCaesar', 'ShortHairTheCaesarSidePart'];
const hairColors = ['Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown', 'BrownDark', 'PastelPink', 'Platinum', 'Red', 'SilverGray'];
const facialHairTypes = ['Blank', 'BeardMedium', 'BeardLight', 'BeardMajestic', 'MoustacheFancy', 'MoustacheMagnum'];
const skinColors = ['Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black'];
const backgrounds = ['minimal', 'courtroom', 'lawOffice'] as const;

export default function AvatarCreatorUI({ initialData, maxLevel, onSave, onClose }: any) {
  const avatarRef = useRef<HTMLDivElement>(null);

  // Avatar State
  const [topType, setTopType] = useState(initialData?.topType || 'ShortHairShortFlat');
  const [hairColor, setHairColor] = useState(initialData?.hairColor || 'BrownDark');
  const [facialHairType, setFacialHairType] = useState(initialData?.facialHairType || 'Blank');
  const [skinColor, setSkinColor] = useState(initialData?.skinColor || 'Light');
  
  const [background, setBackground] = useState<any>(initialData?.background || 'minimal');
  const [customClothe, setCustomClothe] = useState<any>(initialData?.customClothe || 'None');
  const [customAccessory, setCustomAccessory] = useState<any>(initialData?.customAccessory || 'None');

  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<'Face' | 'Cabelo' | 'Roupa' | 'Acessórios' | 'Fundo'>('Face');

  // Lógica de Nível
  const rank = useMemo(() => {
    if (maxLevel >= 7) return 'Juiz';
    if (maxLevel >= 5) return 'Promotor';
    if (maxLevel >= 3) return 'Advogado';
    return 'Estagiário';
  }, [maxLevel]);

  const availableClothes = useMemo(() => {
    const list = [{ id: 'None', label: 'Roupa Casual (Estagiário)' }];
    if (maxLevel >= 3) {
      list.push({ id: 'LawyerSuitBlack', label: 'Terno Preto (Advogado)' });
      list.push({ id: 'LawyerSuitBlue', label: 'Terno Azul (Advogado)' });
      list.push({ id: 'LawyerFemaleSuit', label: 'Terno Feminino (Advogado)' });
    }
    if (maxLevel >= 7) {
      list.push({ id: 'LawyerRobe', label: 'Beca (Juiz)' });
    }
    return list;
  }, [maxLevel]);

  const availableAccessories = useMemo(() => {
    const list = [{ id: 'None', label: 'Nenhum' }];
    if (maxLevel >= 3) {
      list.push({ id: 'LawyerBriefcase', label: 'Maleta Jurídica' });
    }
    if (maxLevel >= 5) {
      list.push({ id: 'JusticePin', label: 'Pin da Balança (Promotor/Juiz)' });
    }
    return list;
  }, [maxLevel]);

  // Exportar como PNG
  const handleExport = async () => {
    if (!avatarRef.current) return;
    try {
      const dataUrl = await toPng(avatarRef.current, { cacheBust: true, quality: 1 });
      const link = document.createElement('a');
      link.download = 'juriquest-avatar.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Falha ao exportar avatar', err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    await onSave({
      topType, hairColor, facialHairType, skinColor,
      background, customClothe, customAccessory
    });
    setLoading(false);
  };

  const randomAvatar = () => {
    setTopType(topTypes[Math.floor(Math.random() * topTypes.length)]);
    setHairColor(hairColors[Math.floor(Math.random() * hairColors.length)]);
    setFacialHairType(facialHairTypes[Math.floor(Math.random() * facialHairTypes.length)]);
    setSkinColor(skinColors[Math.floor(Math.random() * skinColors.length)]);
  };

  return (
    <div className="flex flex-col md:flex-row h-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 font-sans shadow-2xl">
      {/* Esquerda: Preview */}
      <div className="w-full md:w-5/12 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 relative">
        <div className="absolute top-4 left-4 bg-amber-500 text-amber-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {rank}
        </div>
        
        <div ref={avatarRef} className="w-64 h-64 shadow-xl rounded-xl">
          <JuridicalAvatar
            topType={topType}
            hairColor={hairColor}
            facialHairType={facialHairType}
            skinColor={skinColor}
            background={background}
            customClothe={customClothe}
            customAccessory={customAccessory}
          />
        </div>

        <div className="mt-8 flex gap-3 w-full max-w-xs">
          <button onClick={randomAvatar} className="flex-1 py-2 px-4 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition">
            🎲 Aleatório
          </button>
          <button onClick={handleExport} className="flex-1 py-2 px-4 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition">
            📸 Exportar
          </button>
        </div>
      </div>

      {/* Direita: Controles */}
      <div className="w-full md:w-7/12 flex flex-col h-[50vh] md:h-auto">
        {/* Abas */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 shrink-0 custom-scrollbar">
          {['Face', 'Cabelo', 'Roupa', 'Acessórios', 'Fundo'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat as any)}
              className={`px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                category === cat 
                  ? 'text-amber-600 dark:text-amber-500 border-b-2 border-amber-500' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Painel de Opções */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900 custom-scrollbar">
          
          {category === 'Face' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tom de Pele</label>
                <div className="grid grid-cols-4 gap-2">
                  {skinColors.map(c => (
                    <button key={c} onClick={() => setSkinColor(c)} className={`p-2 rounded border ${skinColor === c ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Barba / Bigode</label>
                <select value={facialHairType} onChange={e => setFacialHairType(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500">
                  {facialHairTypes.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          )}

          {category === 'Cabelo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Estilo de Cabelo</label>
                <select value={topType} onChange={e => setTopType(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500">
                  {topTypes.map(h => <option key={h} value={h}>{h.replace(/([A-Z])/g, ' $1').trim()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cor do Cabelo</label>
                <div className="grid grid-cols-3 gap-2">
                  {hairColors.map(c => (
                    <button key={c} onClick={() => setHairColor(c)} className={`p-2 text-sm rounded border ${hairColor === c ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                      {c.replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {category === 'Roupa' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Roupas são desbloqueadas conforme seu nível (ranking).</p>
              {availableClothes.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCustomClothe(c.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${customClothe === c.id ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{c.label}</span>
                </button>
              ))}
            </div>
          )}

          {category === 'Acessórios' && (
            <div className="space-y-4">
              {availableAccessories.map(a => (
                <button
                  key={a.id}
                  onClick={() => setCustomAccessory(a.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${customAccessory === a.id ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{a.label}</span>
                </button>
              ))}
            </div>
          )}

          {category === 'Fundo' && (
            <div className="grid grid-cols-1 gap-4">
              {backgrounds.map(b => (
                <button
                  key={b}
                  onClick={() => setBackground(b)}
                  className={`w-full text-left p-4 rounded-xl border-2 capitalize transition-all ${background === b ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{b.replace('lawOffice', 'Escritório').replace('courtroom', 'Tribunal').replace('minimal', 'Minimalista')}</span>
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Rodapé: Salvar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end shrink-0 gap-3">
          <button onClick={onClose} className="px-6 py-2.5 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="px-8 py-2.5 font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-lg shadow-amber-500/30 transition transform active:scale-95 flex items-center justify-center min-w-[120px]"
          >
            {loading ? 'Salvando...' : 'Salvar Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
}
