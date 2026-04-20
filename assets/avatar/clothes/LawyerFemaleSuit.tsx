import React from 'react';

export default function LawyerFemaleSuit() {
  return (
    <g id="LawyerFemaleSuit" transform="translate(42, 170)">
      {/* Base Blouse (White) */}
      <path d="M45,0 C65,25 115,25 135,0 L180,45 L180,110 L0,110 L0,45 Z" fill="#FFFFFF"/>
      {/* Blouse Neckline Details */}
      <path d="M85,15 C90,30 100,30 105,15" stroke="#E2E2E2" strokeWidth="2" fill="none"/>
      {/* Jacket (Charcoal/Black) */}
      <path d="M0,20 L75,110 L0,110 Z" fill="#2C2C2C"/>
      <path d="M180,20 L105,110 L180,110 Z" fill="#2C2C2C"/>
      <path d="M45,0 L0,20 L0,45 L45,15 Z" fill="#2C2C2C"/>
      <path d="M135,0 L180,20 L180,45 L135,15 Z" fill="#2C2C2C"/>
      {/* Smooth Lapels */}
      <path d="M45,15 C55,40 65,65 75,110 L90,15 Z" fill="#1A1A1A"/>
      <path d="M135,15 C125,40 115,65 105,110 L90,15 Z" fill="#1A1A1A"/>
    </g>
  );
}
