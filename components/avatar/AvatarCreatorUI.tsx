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

  const [topType, setTopType] = useState(initialData?.topType || 'ShortHairShortFlat');
  const [hairColor, setHairColor] = useState(initialData?.hairColor || 'BrownDark');
  const [facialHairType, setFacialHairType] = useState(initialData?.facialHairType || 'Blank');
  const [skinColor, setSkinColor] = useState(initialData?.skinColor || 'Light');
  const [background, setBackground] = useState<any>(initialData?.background || 'minimal');
  const [customClothe, setCustomClothe] = useState<any>(initialData?.customClothe || 'None');
  const [customAccessory, setCustomAccessory] = useState<any>(initialData?.customAccessory || 'None');

  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<'Face' | 'Cabelo' | 'Roupa' | 'Acessórios' | 'Fundo'>('Face');

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
    <div className="min-h-screen bg-gray-900 flex justify-center w-full font-sans text-gray-100">
      <div className="w-full max-w-4xl px-4 py-6 flex flex-col">
        
        {/* Avatar Centralizado */}
        <div className="flex justify-center mb-6">
          <div ref={avatarRef} className="w-[160px] h-[160px] rounded-xl overflow-hidden bg-gray-800 border border-gray-700 shadow-xl flex items-center justify-center relative">
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

        {/* Menu de Abas */}
        <div className="flex justify-center gap-2 flex-wrap mb-6">
          {['Face', 'Cabelo', 'Roupa', 'Acessórios', 'Fundo'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === cat ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Área de Opções (Grid) */}
        <div className="bg-gray-800 rounded-xl p-4 md:p-6 mb-6 flex-1 overflow-y-auto custom-scrollbar">
          
          {category === 'Face' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-gray-400 text-xs uppercase mb-3">Tom de Pele</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {skinColors.map(c => (
                    <button
                      key={c}
                      onClick={() => setSkinColor(c)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors text-center border ${
                        skinColor === c ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-gray-400 text-xs uppercase mb-3">Barba / Bigode</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {facialHairTypes.map(h => (
                    <button
                      key={h}
                      onClick={() => setFacialHairType(h)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors text-center border truncate ${
                        facialHairType === h ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200'
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
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-gray-400 text-xs uppercase mb-3">Cor do Cabelo</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {hairColors.map(c => (
                    <button
                      key={c}
                      onClick={() => setHairColor(c)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors text-center border ${
                        hairColor === c ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200'
                      }`}
                    >
                      {formatName(c)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-gray-400 text-xs uppercase mb-3">Estilo de Cabelo</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {topTypes.map(h => (
                    <button
                      key={h}
                      onClick={() => setTopType(h)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors text-center border truncate ${
                        topType === h ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200'
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
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-gray-400 text-xs uppercase mb-3">Trajes Formal</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableClothes.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCustomClothe(c.id)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors text-center border truncate ${
                        customClothe === c.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {category === 'Acessórios' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-gray-400 text-xs uppercase mb-3">Acessórios de Prestígio</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableAccessories.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setCustomAccessory(a.id)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors text-center border truncate ${
                        customAccessory === a.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {category === 'Fundo' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-gray-400 text-xs uppercase mb-3">Cor de Fundo</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {backgrounds.map(b => (
                    <button
                      key={b}
                      onClick={() => setBackground(b)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors text-center border capitalize ${
                        background === b ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200'
                      }`}
                    >
                      {b.replace('lawOffice', 'Escritório').replace('courtroom', 'Tribunal').replace('minimal', 'Minimalista')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Botões Principais / Ações */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="flex gap-4 w-full sm:w-auto">
            <button 
              onClick={randomAvatar} 
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium border border-gray-600 flex-1 sm:flex-none"
            >
              🎲 Aleatório
            </button>
            <button 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium border border-gray-600 flex-1 sm:flex-none hidden sm:block"
            >
              Cancelar
            </button>
          </div>
          
          <div className="flex gap-4 w-full sm:w-auto">
            <button 
              onClick={handleExport} 
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium border border-gray-600 flex-1 sm:flex-none"
            >
              📸 Exportar
            </button>
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md flex-1 sm:flex-none"
            >
              {loading ? 'Salvando...' : 'Salvar Avatar'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
