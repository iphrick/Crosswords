import React from 'react';

export default function LawyerRobe() {
  return (
    <g id="LawyerRobe" transform="translate(30, 160)">
      {/* Base Robe (Black) covering entire body */}
      <path d="M30,0 C60,10 140,10 170,0 L210,60 L210,120 L-10,120 L-10,60 Z" fill="#111111"/>
      
      {/* White Collar (Jabot/Band) */}
      <path d="M75,10 C85,20 115,20 125,10 L115,50 L100,40 L85,50 Z" fill="#FFFFFF"/>
      <path d="M100,40 L100,80" stroke="#E0E0E0" strokeWidth="3" fill="none"/>
      
      {/* Robe Folds/Shadows to make it look like a judge robe */}
      <path d="M70,25 C60,60 50,120 50,120 L70,120 C80,60 80,30 80,30 Z" fill="#0A0A0A"/>
      <path d="M130,25 C140,60 150,120 150,120 L130,120 C120,60 120,30 120,30 Z" fill="#0A0A0A"/>
      
      {/* Sleeve Lines */}
      <path d="M30,10 C20,40 -10,70 -10,70" stroke="#000000" strokeWidth="4" fill="none"/>
      <path d="M170,10 C180,40 210,70 210,70" stroke="#000000" strokeWidth="4" fill="none"/>
    </g>
  );
}
