import React from 'react';
import Avatar from 'avataaars';
import LawyerSuitBlack from '../../assets/avatar/clothes/LawyerSuitBlack';
import LawyerSuitBlue from '../../assets/avatar/clothes/LawyerSuitBlue';
import LawyerFemaleSuit from '../../assets/avatar/clothes/LawyerFemaleSuit';
import LawyerRobe from '../../assets/avatar/clothes/LawyerRobe';
import JusticePin from '../../assets/avatar/accessories/JusticePin';
import LawyerBriefcase from '../../assets/avatar/accessories/LawyerBriefcase';

export type JuridicalAvatarProps = {
  // Avataaars props
  avatarStyle?: 'Circle' | 'Transparent';
  topType?: string;
  accessoriesType?: string;
  facialHairType?: string;
  facialHairColor?: string;
  clotheType?: string;
  eyeType?: string;
  eyebrowType?: string;
  mouthType?: string;
  skinColor?: string;
  hairColor?: string;
  // Custom Juridical Props
  background?: 'courtroom' | 'lawOffice' | 'minimal';
  customClothe?: 'LawyerSuitBlack' | 'LawyerSuitBlue' | 'LawyerFemaleSuit' | 'LawyerRobe' | 'None';
  customAccessory?: 'LawyerBriefcase' | 'JusticePin' | 'None';
  size?: number | string;
};

export default function JuridicalAvatar(props: JuridicalAvatarProps) {
  const {
    avatarStyle = 'Transparent',
    background = 'minimal',
    customClothe = 'None',
    customAccessory = 'None',
    size = '100%',
    ...avataaarProps
  } = props;

  // Render proper background
  let bgClass = '';
  if (background === 'courtroom') bgClass = 'bg-gradient-to-br from-amber-900 to-stone-800';
  if (background === 'lawOffice') bgClass = 'bg-gradient-to-br from-slate-700 to-slate-900';
  if (background === 'minimal')   bgClass = 'bg-slate-100 dark:bg-slate-800';

  // Se usar roupa customizada, passamos 'ShirtCrewNeck' com cor transparente/preta pro Avataaar
  const baseClotheType = customClothe !== 'None' ? 'ShirtCrewNeck' : (avataaarProps.clotheType || 'BlazerShirt');

  return (
    <div 
      className={`relative rounded-xl overflow-hidden shadow-inner flex items-center justify-center ${bgClass}`}
      style={{ width: size, height: size, aspectRatio: '1/1' }}
    >
      <div className="absolute inset-0 z-10 p-2">
        <Avatar
          style={{ width: '100%', height: '100%' }}
          avatarStyle={avatarStyle}
          {...avataaarProps}
          clotheType={baseClotheType}
        />
      </div>

      {/* SVG Overlays */}
      <div className="absolute inset-0 z-20 pointer-events-none p-2">
        <svg viewBox="0 0 264 280" width="100%" height="100%">
          {/* Custom Clothes */}
          {customClothe === 'LawyerSuitBlack' && <LawyerSuitBlack />}
          {customClothe === 'LawyerSuitBlue' && <LawyerSuitBlue />}
          {customClothe === 'LawyerFemaleSuit' && <LawyerFemaleSuit />}
          {customClothe === 'LawyerRobe' && <LawyerRobe />}
          
          {/* Custom Accessories */}
          {customAccessory === 'JusticePin' && <JusticePin />}
          {customAccessory === 'LawyerBriefcase' && <LawyerBriefcase />}
        </svg>
      </div>
    </div>
  );
}
