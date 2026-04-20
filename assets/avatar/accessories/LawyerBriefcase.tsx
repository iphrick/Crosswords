import React from 'react';

export default function LawyerBriefcase() {
  return (
    <g id="LawyerBriefcase" transform="translate(15, 200)">
      {/* Handle */}
      <path d="M25,0 L35,0 L35,10 L25,10 Z" fill="none" stroke="#4A3C00" strokeWidth="4"/>
      <path d="M20,5 C20,0 40,0 40,5 L40,15 L20,15 Z" fill="none" stroke="#654321" strokeWidth="4"/>
      {/* Base Bag */}
      <rect x="0" y="10" width="60" height="45" rx="4" fill="#5C4033"/>
      {/* Flap */}
      <path d="M0,10 L60,10 L55,25 L5,25 Z" fill="#3E2723"/>
      {/* Lock */}
      <rect x="25" y="20" width="10" height="10" rx="2" fill="#DAA520"/>
      <circle cx="30" cy="25" r="2" fill="#2C1A00"/>
    </g>
  );
}
