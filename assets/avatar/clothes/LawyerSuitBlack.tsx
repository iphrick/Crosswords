import React from 'react';

export default function LawyerSuitBlack() {
  return (
    <g id="LawyerSuitBlack" transform="translate(42, 170)">
      {/* Base Shirt (White) */}
      <path d="M45,0 C65,15 115,15 135,0 L180,50 L180,110 L0,110 L0,50 Z" fill="#F4F4F4"/>
      {/* Tie (Red) */}
      <path d="M85,10 L95,10 L100,75 L90,90 L80,75 Z" fill="#8B0000"/>
      {/* Jacket (Dark Gray/Black) */}
      <path d="M0,25 L65,110 L0,110 Z" fill="#212121"/>
      <path d="M180,25 L115,110 L180,110 Z" fill="#212121"/>
      <path d="M45,0 L0,25 L0,50 L45,15 Z" fill="#212121"/>
      <path d="M135,0 L180,25 L180,50 L135,15 Z" fill="#212121"/>
      {/* Lapels */}
      <path d="M45,15 L65,70 L85,15 Z" fill="#171717"/>
      <path d="M135,15 L115,70 L95,15 Z" fill="#171717"/>
    </g>
  );
}
