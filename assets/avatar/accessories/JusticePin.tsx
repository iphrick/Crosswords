import React from 'react';

export default function JusticePin() {
  return (
    <g id="JusticePin" transform="translate(155, 205)">
      {/* Base Circle */}
      <circle cx="8" cy="8" r="7" fill="#DAA520" stroke="#B8860B" strokeWidth="1"/>
      {/* Mini Scale of Justice inside */}
      <path d="M8,3 L8,12" stroke="#4A3C00" strokeWidth="1.5"/>
      <path d="M4,5 L12,5" stroke="#4A3C00" strokeWidth="1"/>
      <path d="M4,5 L3,9 L5,9 Z" fill="#4A3C00"/>
      <path d="M12,5 L11,9 L13,9 Z" fill="#4A3C00"/>
      <path d="M6,12 L10,12" stroke="#4A3C00" strokeWidth="1.5"/>
    </g>
  );
}
