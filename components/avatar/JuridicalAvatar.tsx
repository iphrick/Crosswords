import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

import LawyerSuitBlack from '../../assets/avatar/clothes/LawyerSuitBlack';
import LawyerSuitBlue from '../../assets/avatar/clothes/LawyerSuitBlue';
import LawyerFemaleSuit from '../../assets/avatar/clothes/LawyerFemaleSuit';
import LawyerRobe from '../../assets/avatar/clothes/LawyerRobe';
import JusticePin from '../../assets/avatar/accessories/JusticePin';
import LawyerBriefcase from '../../assets/avatar/accessories/LawyerBriefcase';

export type JuridicalAvatarProps = {
  topType?: string;
  hairColor?: string;
  facialHairType?: string;
  skinColor?: string;
  
  // Custom Juridical Props
  background?: 'minimal' | 'courtroom' | 'lawOffice';
  customClothe?: 'None' | 'LawyerSuitBlack' | 'LawyerSuitBlue' | 'LawyerFemaleSuit' | 'LawyerRobe';
  customAccessory?: 'None' | 'JusticePin' | 'LawyerBriefcase';
  size?: number;
};

// ---- Mappings from legacy avataaars to DiceBear ----
const mapTop = (old: string): string[] => {
  if (old === 'NoHair' || old === 'Eyepatch') return [];
  const mapping: Record<string, string> = {
    Hat: 'hat', Hijab: 'hijab', Turban: 'turban', WinterHat1: 'winterHat1', WinterHat2: 'winterHat02', WinterHat3: 'winterHat03', WinterHat4: 'winterHat04',
    LongHairBigHair: 'bigHair', LongHairBob: 'bob', LongHairBun: 'bun', LongHairCurly: 'curly', LongHairCurvy: 'curvy', LongHairDreads: 'dreads',
    LongHairFrida: 'frida', LongHairFro: 'fro', LongHairFroBand: 'froBand', LongHairNotTooLong: 'longButNotTooLong', LongHairShavedSides: 'shavedSides',
    LongHairMiaWallace: 'miaWallace', LongHairStraight: 'straight01', LongHairStraight2: 'straight02', LongHairStraightStrand: 'straightAndStrand',
    ShortHairDreads01: 'dreads01', ShortHairDreads02: 'dreads02', ShortHairFrizzle: 'frizzle', ShortHairShaggyMullet: 'shaggyMullet',
    ShortHairShortCurly: 'shortCurly', ShortHairShortFlat: 'shortFlat', ShortHairShortRound: 'shortRound', ShortHairShortWaved: 'shortWaved',
    ShortHairSides: 'sides', ShortHairTheCaesar: 'theCaesar', ShortHairTheCaesarSidePart: 'theCaesarAndSidePart'
  };
  return mapping[old] ? [mapping[old]] : ['shortFlat'];
};

const mapFacialHair = (old: string): string[] => {
  if (!old || old === 'Blank') return [];
  const mapping: Record<string, string> = {
    BeardLight: 'beardLight', BeardMajestic: 'beardMajestic', BeardMedium: 'beardMedium',
    MoustacheFancy: 'moustacheFancy', MoustacheMagnum: 'moustacheMagnum'
  };
  return mapping[old] ? [mapping[old]] : [];
};

const mapSkinColor = (old: string): string[] => {
  const mapping: Record<string, string> = {
    Tanned: 'fd9841', Yellow: 'f8d25c', Pale: 'ffdbb4', Light: 'edb98a',
    Brown: 'd08b5b', DarkBrown: 'ae5d29', Black: '614335'
  };
  return [mapping[old] || 'edb98a'];
};

const mapHairColor = (old: string): string[] => {
  const mapping: Record<string, string> = {
    Auburn: 'a55728', Black: '2c1b18', Blonde: 'b58143', BlondeGolden: 'd6b370',
    Brown: '724133', BrownDark: '4a312c', PastelPink: 'f59797', Platinum: 'ecdcbf',
    Red: 'c93305', SilverGray: 'e8e1e1'
  };
  return [mapping[old] || '4a312c'];
};

export default function JuridicalAvatar({
  topType = 'ShortHairShortFlat',
  hairColor = 'BrownDark',
  facialHairType = 'Blank',
  skinColor = 'Light',
  background = 'minimal',
  customClothe = 'None',
  customAccessory = 'None',
  size = 264
}: JuridicalAvatarProps) {
  
  const bgStyle = useMemo(() => {
    if (background === 'courtroom') return { backgroundColor: '#8B5A2B' };
    if (background === 'lawOffice') return { backgroundColor: '#2F4F4F' };
    return { backgroundColor: '#F0F0F0' }; // minimal
  }, [background]);

  const dicebearSvg = useMemo(() => {
    const avatar = createAvatar(avataaars, {
      style: ['circle'],
      top: mapTop(topType) as any,
      hairColor: mapHairColor(hairColor),
      facialHair: mapFacialHair(facialHairType) as any,
      facialHairColor: mapHairColor(hairColor), // matches hair
      skinColor: mapSkinColor(skinColor),
      clothing: customClothe === 'None' ? ['blazerAndShirt'] : ['shirtCrewNeck'],
      clothesColor: ['262e33'], // dark grey by default
      eyes: ['default'],
      mouth: ['default'],
      eyebrows: ['defaultNatural'],
      radius: 50,
      size: size
    });
    return avatar.toString();
  }, [topType, hairColor, facialHairType, skinColor, customClothe, size]);

  const hasOverlay = customClothe !== 'None' || customAccessory !== 'None';

  return (
    <div 
      className="relative rounded-full overflow-hidden flex items-center justify-center shadow-inner"
      style={{ width: size, height: size, ...bgStyle }}
    >
      {/* 1. Base Avatar from DiceBear */}
      <div 
        className="absolute inset-0 z-0 w-full h-full flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: dicebearSvg }}
      />

      {/* 2. Custom Juridical SVG Overlays */}
      {hasOverlay && (
        <svg
          viewBox="0 0 264 280"
          className="absolute inset-0 z-10 w-full h-full pointer-events-none"
          preserveAspectRatio="xMidYMid meet"
        >
          {customClothe === 'LawyerSuitBlack' && <LawyerSuitBlack />}
          {customClothe === 'LawyerSuitBlue' && <LawyerSuitBlue />}
          {customClothe === 'LawyerFemaleSuit' && <LawyerFemaleSuit />}
          {customClothe === 'LawyerRobe' && <LawyerRobe />}
          
          {customAccessory === 'JusticePin' && <JusticePin />}
          {customAccessory === 'LawyerBriefcase' && <LawyerBriefcase />}
        </svg>
      )}
    </div>
  );
}
