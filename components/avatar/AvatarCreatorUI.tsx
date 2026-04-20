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

  const formatName = (str: string) => str.replace(/([A-Z])/g, ' $1').trim();

  return (
    <div className="w-full bg-gray-900 text-gray-100 rounded-xl overflow-y-auto max-h-[90vh] custom-scrollbar">
      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Avatar (preview) */}
        <div className="flex justify-center mb-6 relative">
          <div className="absolute top-0 right-0 md:right-10 bg-blue-600 text-xs px-3 py-1 rounded-full font-bold shadow-md">
            Rank: {rank}
          </div>
          
          <div ref={avatarRef} className="w-[160px] h-[160px] rounded-xl shadow-lg border border-gray-700 bg-gray-800 flex items-center justify-center">
            <JuridicalAvatar
              topType={topType}
              hairColor={hairColor}
              facialHairType={facialHairType}
              skinColor={skinColor}
              background={background}
              customClothe={customClothe}
              customAccessory={customAccessory}
              size={160}
            />
          </div>
        </div>

        {/* Abas (menu) */}
        <div className="flex gap-2 justify-center flex-wrap mb-6">
          {['Face', 'Cabelo', 'Roupa', 'Acessórios', 'Fundo'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === cat 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Área de opções */}
        <div className="bg-gray-800 rounded-xl p-4 shadow-inner border border-gray-700">
          
          {category === 'Face' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Tom de Pele</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {skinColors.map(c => (
                    <button
                      key={c}
                      onClick={() => setSkinColor(c)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors border ${
                        skinColor === c ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Barba / Bigode</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {facialHairTypes.map(h => (
                    <button
                      key={h}
                      onClick={() => setFacialHairType(h)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors border truncate ${
                        facialHairType === h ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                      }`}
                    >
                      {h === 'Blank' ? 'Nenhum' : formatName(h).replace('Beard', 'Barba ').replace('Moustache', 'Bigode ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {category === 'Cabelo' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Cor do Cabelo</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {hairColors.map(c => (
                    <button
                      key={c}
                      onClick={() => setHairColor(c)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors border ${
                        hairColor === c ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                      }`}
                    >
                      {formatName(c)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Estilo de Cabelo</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {topTypes.map(h => (
                    <button
                      key={h}
                      onClick={() => setTopType(h)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors border truncate ${
                        topType === h ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                      }`}
                      title={formatName(h)}
                    >
                      {formatName(h)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {category === 'Roupa' && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Trajes Formal (Por Nível)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableClothes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCustomClothe(c.id)}
                    className={`px-3 py-3 flex justify-between items-center rounded-lg text-sm transition-colors border ${
                      customClothe === c.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                    }`}
                  >
                    <span>{c.label}</span>
                    {customClothe === c.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {category === 'Acessórios' && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Acessórios de Prestígio</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableAccessories.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setCustomAccessory(a.id)}
                    className={`px-3 py-3 flex justify-between items-center rounded-lg text-sm transition-colors border ${
                      customAccessory === a.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                    }`}
                  >
                    <span>{a.label}</span>
                    {customAccessory === a.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {category === 'Fundo' && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Cor de Fundo</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {backgrounds.map(b => (
                  <button
                    key={b}
                    onClick={() => setBackground(b)}
                    className={`px-3 py-3 flex flex-col items-center gap-2 rounded-lg text-sm transition-colors border capitalize ${
                      background === b ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full border border-gray-500" style={{ 
                      backgroundColor: b === 'courtroom' ? '#8B5A2B' : b === 'lawOffice' ? '#2F4F4F' : '#F0F0F0' 
                    }}></div>
                    <span>{b.replace('lawOffice', 'Escritório').replace('courtroom', 'Tribunal').replace('minimal', 'Minimalista')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Botões principais */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 border-t border-gray-800 pt-6">
          <div className="flex gap-4 w-full sm:w-auto">
            <button 
              onClick={randomAvatar} 
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-medium border border-gray-600 flex items-center justify-center gap-2"
            >
              <span>🎲</span> Aleatório
            </button>
            <button 
              onClick={handleExport} 
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-medium border border-gray-600 flex items-center justify-center gap-2"
            >
              <span>📸</span> Exportar
            </button>
          </div>
          
          <div className="flex gap-4 w-full sm:w-auto justify-end">
            <button 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg transition-transform active:scale-95"
            >
              {loading ? 'Salvando...' : 'Salvar Avatar'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
