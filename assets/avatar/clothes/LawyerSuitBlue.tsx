import React from 'react';

export default function LawyerSuitBlue() {
  return (
    <g id="LawyerSuitBlue" transform="translate(42, 170)">
      {/* Base Shirt (White) */}
      <path d="M45,0 C65,15 115,15 135,0 L180,50 L180,110 L0,110 L0,50 Z" fill="#FFFFFF"/>
      {/* Tie (Light Blue/Silver) */}
      <path d="M85,10 L95,10 L100,75 L90,90 L80,75 Z" fill="#4B9CD3"/>
      {/* Jacket (Navy Blue) */}
      <path d="M0,25 L65,110 L0,110 Z" fill="#0A1F3D"/>
      <path d="M180,25 L115,110 L180,110 Z" fill="#0A1F3D"/>
      <path d="M45,0 L0,25 L0,50 L45,15 Z" fill="#0A1F3D"/>
      <path d="M135,0 L180,25 L180,50 L135,15 Z" fill="#0A1F3D"/>
      {/* Lapels */}
      <path d="M45,15 L65,70 L85,15 Z" fill="#061326"/>
      <path d="M135,15 L115,70 L95,15 Z" fill="#061326"/>
    </g>
  );
}
