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
    const list = [{ id: 'None', label: 'Roupa Casual' }];
    if (maxLevel >= 3) {
      list.push({ id: 'LawyerSuitBlack', label: 'Terno Preto' });
      list.push({ id: 'LawyerSuitBlue', label: 'Terno Azul' });
      list.push({ id: 'LawyerFemaleSuit', label: 'Terno Feminino' });
    }
    if (maxLevel >= 7) {
      list.push({ id: 'LawyerRobe', label: 'Beca' });
    }
    return list;
  }, [maxLevel]);

  const availableAccessories = useMemo(() => {
    const list = [{ id: 'None', label: 'Nenhum' }];
    if (maxLevel >= 3) {
      list.push({ id: 'LawyerBriefcase', label: 'Maleta Jurídica' });
    }
    if (maxLevel >= 5) {
      list.push({ id: 'JusticePin', label: 'Pin da Justiça' });
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

  // Helper para formatação de nomes camelCase
  const formatName = (str: string) => str.replace(/([A-Z])/g, ' $1').trim();

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto bg-surface rounded-2xl overflow-hidden border border-border shadow-2xl font-sans">
      
      {/* 1. SEÇÃO DO AVATAR (TOPO) */}
      <div className="w-full bg-surface2 p-6 pb-8 relative flex flex-col items-center justify-center border-b border-border">
        {/* Badge do Ranking (Canto Superior Esquerdo) */}
        <div className="absolute top-5 left-5 bg-accent text-surface text-xs md:text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
          {rank}
        </div>
        
        {/* Botão Aleatório (Canto Inferior Esquerdo) */}
        <button 
          onClick={randomAvatar} 
          className="absolute bottom-5 left-5 px-4 py-2 bg-surface hover:bg-border text-text font-semibold rounded-lg border border-border transition-colors flex items-center gap-2 text-sm"
        >
          <span>🎲</span> <span className="hidden sm:inline">Aleatório</span>
        </button>

        {/* Botão Exportar (Canto Inferior Direito) */}
        <button 
          onClick={handleExport} 
          className="absolute bottom-5 right-5 px-4 py-2 bg-surface hover:bg-border text-text font-semibold rounded-lg border border-border transition-colors flex items-center gap-2 text-sm"
        >
          <span>📸</span> <span className="hidden sm:inline">Exportar</span>
        </button>

        <div ref={avatarRef} className="w-48 h-48 md:w-56 md:h-56 shadow-2xl rounded-xl mt-4">
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
      </div>

      {/* 2. ABAS DE NAVEGAÇÃO */}
      <div className="flex overflow-x-auto border-b border-border bg-surface shrink-0 custom-scrollbar justify-start sm:justify-center">
        {['Face', 'Cabelo', 'Roupa', 'Acessórios', 'Fundo'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat as any)}
            className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all ${
              category === cat 
                ? 'text-accent border-b-2 border-accent bg-accentDim/30' 
                : 'text-textMuted hover:text-text hover:bg-surface2'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. PAINEL DE CONTEÚDO (GRID) */}
      <div className="p-6 bg-surface h-[40vh] sm:h-[45vh] overflow-y-auto custom-scrollbar">
        
        {category === 'Face' && (
          <div className="space-y-8">
            {/* Tom de Pele */}
            <section>
              <h3 className="text-sm font-bold text-text mb-3 uppercase tracking-wider">Tom de Pele</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {skinColors.map(c => (
                  <button 
                    key={c} 
                    onClick={() => setSkinColor(c)} 
                    className={`p-3 rounded-xl border-2 transition-all font-medium text-sm ${skinColor === c ? 'border-accent bg-accentDim text-accent shadow-md' : 'border-border text-textMuted hover:border-textMuted hover:text-text'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </section>
            
            {/* Pelos Faciais */}
            <section>
              <h3 className="text-sm font-bold text-text mb-3 uppercase tracking-wider">Barba / Bigode</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {facialHairTypes.map(h => (
                  <button 
                    key={h} 
                    onClick={() => setFacialHairType(h)} 
                    className={`p-3 rounded-xl border-2 transition-all font-medium text-sm ${facialHairType === h ? 'border-accent bg-accentDim text-accent shadow-md' : 'border-border text-textMuted hover:border-textMuted hover:text-text'}`}
                  >
                    {h === 'Blank' ? 'Nenhum' : formatName(h).replace('Beard', 'Barba ').replace('Moustache', 'Bigode ')}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {category === 'Cabelo' && (
          <div className="space-y-8">
            {/* Cor do Cabelo */}
            <section>
              <h3 className="text-sm font-bold text-text mb-3 uppercase tracking-wider">Cor do Cabelo</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {hairColors.map(c => (
                  <button 
                    key={c} 
                    onClick={() => setHairColor(c)} 
                    className={`p-2.5 rounded-xl border-2 transition-all font-medium text-sm ${hairColor === c ? 'border-accent bg-accentDim text-accent shadow-md' : 'border-border text-textMuted hover:border-textMuted hover:text-text'}`}
                  >
                    {formatName(c)}
                  </button>
                ))}
              </div>
            </section>

            {/* Estilo do Cabelo */}
            <section>
              <h3 className="text-sm font-bold text-text mb-3 uppercase tracking-wider">Estilo de Cabelo</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {topTypes.map(h => (
                  <button 
                    key={h} 
                    onClick={() => setTopType(h)} 
                    className={`p-3 rounded-xl border-2 transition-all font-medium text-xs sm:text-sm truncate ${topType === h ? 'border-accent bg-accentDim text-accent shadow-md' : 'border-border text-textMuted hover:border-textMuted hover:text-text'}`}
                    title={formatName(h)}
                  >
                    {formatName(h)}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {category === 'Roupa' && (
          <section className="space-y-4">
            <p className="text-sm text-textMuted mb-4">Roupas formais são desbloqueadas conforme você avança de nível.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableClothes.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCustomClothe(c.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${customClothe === c.id ? 'border-accent bg-accentDim shadow-md' : 'border-border bg-surface2 hover:border-accent hover:bg-surface'}`}
                >
                  <span className={`font-semibold ${customClothe === c.id ? 'text-accent' : 'text-text'}`}>{c.label}</span>
                  {customClothe === c.id && <span className="text-accent text-lg">✓</span>}
                </button>
              ))}
            </div>
          </section>
        )}

        {category === 'Acessórios' && (
          <section className="space-y-4">
            <p className="text-sm text-textMuted mb-4">Acessórios de prestígio são liberados nos níveis Promotor e Juiz.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableAccessories.map(a => (
                <button
                  key={a.id}
                  onClick={() => setCustomAccessory(a.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${customAccessory === a.id ? 'border-accent bg-accentDim shadow-md' : 'border-border bg-surface2 hover:border-accent hover:bg-surface'}`}
                >
                  <span className={`font-semibold ${customAccessory === a.id ? 'text-accent' : 'text-text'}`}>{a.label}</span>
                  {customAccessory === a.id && <span className="text-accent text-lg">✓</span>}
                </button>
              ))}
            </div>
          </section>
        )}

        {category === 'Fundo' && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {backgrounds.map(b => (
                <button
                  key={b}
                  onClick={() => setBackground(b)}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${background === b ? 'border-accent bg-accentDim shadow-md' : 'border-border bg-surface2 hover:border-accent hover:bg-surface'}`}
                >
                  <div className="w-12 h-12 rounded-full mb-3 shadow-inner" style={{ 
                    backgroundColor: b === 'courtroom' ? '#8B5A2B' : b === 'lawOffice' ? '#2F4F4F' : '#F0F0F0' 
                  }}></div>
                  <span className={`font-semibold capitalize ${background === b ? 'text-accent' : 'text-text'}`}>
                    {b.replace('lawOffice', 'Escritório').replace('courtroom', 'Tribunal').replace('minimal', 'Minimalista')}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* 4. RODAPÉ (FIXO NA PARTE INFERIOR) */}
      <div className="p-5 border-t border-border bg-surface2 flex justify-end items-center gap-4 shrink-0">
        <button 
          onClick={onClose} 
          className="px-6 py-2.5 font-bold text-textMuted hover:text-text hover:bg-border rounded-xl transition-all"
        >
          Cancelar
        </button>
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="px-8 py-3 font-bold bg-accent hover:brightness-110 text-bg rounded-xl shadow-lg shadow-accent/20 transition-all transform active:scale-95 flex items-center justify-center min-w-[140px]"
        >
          {loading ? 'Salvando...' : 'Salvar Avatar'}
        </button>
      </div>
    </div>
  );
}
