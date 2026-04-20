import React, { useState, useRef, useMemo } from 'react';
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
      const { toPng } = await import('html-to-image');
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
    <div className="flex flex-col md:flex-row h-full max-h-[85vh] bg-surface rounded-lg overflow-hidden border border-border font-sans shadow-2xl">
      {/* Esquerda: Preview */}
      <div className="w-full md:w-5/12 bg-surface2 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border relative">
        <div className="absolute top-4 left-4 bg-accent text-surface text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
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
          <button onClick={randomAvatar} className="flex-1 py-2 px-4 bg-surface text-text font-semibold rounded-lg border border-border hover:border-accent transition">
            🎲 Aleatório
          </button>
          <button onClick={handleExport} className="flex-1 py-2 px-4 bg-surface text-text font-semibold rounded-lg border border-border hover:border-accent transition">
            📸 Exportar
          </button>
        </div>
      </div>

      {/* Direita: Controles */}
      <div className="w-full md:w-7/12 flex flex-col h-[50vh] md:h-auto">
        {/* Abas */}
        <div className="flex overflow-x-auto border-b border-border shrink-0 custom-scrollbar">
          {['Face', 'Cabelo', 'Roupa', 'Acessórios', 'Fundo'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat as any)}
              className={`px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                category === cat 
                  ? 'text-accent border-b-2 border-accent' 
                  : 'text-textMuted hover:text-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Painel de Opções */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface custom-scrollbar">
          
          {category === 'Face' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Tom de Pele</label>
                <div className="grid grid-cols-4 gap-2">
                  {skinColors.map(c => (
                    <button key={c} onClick={() => setSkinColor(c)} className={`p-2 rounded border ${skinColor === c ? 'border-accent bg-accentDim text-accent font-semibold' : 'border-border text-text'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Barba / Bigode</label>
                <select value={facialHairType} onChange={e => setFacialHairType(e.target.value)} className="w-full p-2.5 bg-surface2 border border-border rounded-lg text-text outline-none focus:border-accent">
                  {facialHairTypes.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          )}

          {category === 'Cabelo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Estilo de Cabelo</label>
                <select value={topType} onChange={e => setTopType(e.target.value)} className="w-full p-2.5 bg-surface2 border border-border rounded-lg text-text outline-none focus:border-accent">
                  {topTypes.map(h => <option key={h} value={h}>{h.replace(/([A-Z])/g, ' $1').trim()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Cor do Cabelo</label>
                <div className="grid grid-cols-3 gap-2">
                  {hairColors.map(c => (
                    <button key={c} onClick={() => setHairColor(c)} className={`p-2 text-sm rounded border ${hairColor === c ? 'border-accent bg-accentDim text-accent font-semibold' : 'border-border text-textMuted'}`}>
                      {c.replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {category === 'Roupa' && (
            <div className="space-y-4">
              <p className="text-sm text-textMuted mb-4">Roupas são desbloqueadas conforme seu nível (ranking).</p>
              {availableClothes.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCustomClothe(c.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${customClothe === c.id ? 'border-accent bg-accentDim shadow-md' : 'border-border hover:border-accent'}`}
                >
                  <span className="font-semibold text-text">{c.label}</span>
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
                  className={`w-full text-left p-4 rounded-xl border transition-all ${customAccessory === a.id ? 'border-accent bg-accentDim shadow-md' : 'border-border hover:border-accent'}`}
                >
                  <span className="font-semibold text-text">{a.label}</span>
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
                  className={`w-full text-left p-4 rounded-xl border capitalize transition-all ${background === b ? 'border-accent bg-accentDim shadow-md' : 'border-border hover:border-accent'}`}
                >
                  <span className="font-semibold text-text">{b.replace('lawOffice', 'Escritório').replace('courtroom', 'Tribunal').replace('minimal', 'Minimalista')}</span>
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Rodapé: Salvar */}
        <div className="p-4 border-t border-border bg-surface flex justify-end shrink-0 gap-3">
          <button onClick={onClose} className="px-6 py-2.5 font-semibold text-textMuted hover:text-text hover:bg-surface2 rounded-lg transition">
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="px-8 py-2.5 font-semibold bg-accent hover:opacity-90 text-surface rounded-lg shadow-lg shadow-accent/30 transition transform active:scale-95 flex items-center justify-center min-w-[120px]"
          >
            {loading ? 'Salvando...' : 'Salvar Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
}
