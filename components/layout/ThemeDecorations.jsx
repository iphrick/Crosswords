// components/layout/ThemeDecorations.jsx
'use client';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

/* ─── Image-based decorations (existing themes) ─────────────────────────── */
const THEME_DECORATIONS = {
  default: [],
  'world-cup': [
    { src: '/themes/worldcup-trophy.png', alt: 'Taça',     style: { position: 'fixed', bottom: '-30px', right: '-20px',  width: '260px', opacity: 0.12, pointerEvents: 'none', zIndex: 0, transform: 'rotate(-10deg)' } },
    { src: '/themes/worldcup-ball.png',   alt: 'Bola',     style: { position: 'fixed', top: '100px',  left: '-40px',   width: '180px', opacity: 0.08, pointerEvents: 'none', zIndex: 0, transform: 'rotate(15deg)' } },
    { src: '/themes/worldcup-flag.png',   alt: 'Bandeira', style: { position: 'fixed', top: '-20px',  right: '10%',    width: '220px', opacity: 0.10, pointerEvents: 'none', zIndex: 0 } },
  ],
  cyberpunk: [
    { src: '/themes/cyberpunk-circuit.png', alt: 'Circuito', style: { position: 'fixed', bottom: '-60px', left: '-60px',  width: '400px', opacity: 0.08, pointerEvents: 'none', zIndex: 0, transform: 'rotate(-20deg)' } },
    { src: '/themes/cyberpunk-circuit.png', alt: 'Circuito', style: { position: 'fixed', top: '-60px',  right: '-60px', width: '350px', opacity: 0.06, pointerEvents: 'none', zIndex: 0, transform: 'rotate(160deg)' } },
  ],
  forest: [
    { src: '/themes/forest-leaves.png', alt: 'Folhas', style: { position: 'fixed', top: '-40px',   left: '-40px',  width: '350px', opacity: 0.10, pointerEvents: 'none', zIndex: 0, transform: 'rotate(-5deg)' } },
    { src: '/themes/forest-leaves.png', alt: 'Folhas', style: { position: 'fixed', bottom: '-60px', right: '-60px', width: '400px', opacity: 0.08, pointerEvents: 'none', zIndex: 0, transform: 'rotate(180deg)' } },
  ],
  royal: [
    { src: '/themes/royal-crown.png', alt: 'Coroa', style: { position: 'fixed', top: '80px',    right: '-30px', width: '220px', opacity: 0.10, pointerEvents: 'none', zIndex: 0, transform: 'rotate(10deg)' } },
    { src: '/themes/royal-crown.png', alt: 'Coroa', style: { position: 'fixed', bottom: '-20px', left: '-30px',  width: '200px', opacity: 0.06, pointerEvents: 'none', zIndex: 0, transform: 'rotate(-15deg) scaleX(-1)' } },
  ],
};

/* ─── Floating bubble configs for new CSS themes ─────────────────────────── */
/*
  Each bubble: { char, size, startX, delay, duration, amplitude }
  - startX: horizontal start as % of viewport width
  - delay: animation delay in seconds
  - duration: float cycle duration in seconds
  - amplitude: horizontal sway amplitude in px
  - size: font-size in px
*/
const BUBBLE_CONFIGS = {
  steampunk: {
    gradient: `
      radial-gradient(circle at 15% 85%, rgba(139,105,20,0.14) 0%, transparent 45%),
      radial-gradient(circle at 85% 15%, rgba(205,133,63,0.10) 0%, transparent 40%)
    `,
    bubbles: [
      { char: '⚙️', size: 48, startX: 8,  delay: 0,   duration: 9,  amplitude: 18 },
      { char: '⚙️', size: 28, startX: 20, delay: 2.5, duration: 12, amplitude: 12 },
      { char: '🔩', size: 36, startX: 35, delay: 1,   duration: 10, amplitude: 20 },
      { char: '⏱️', size: 40, startX: 55, delay: 3.5, duration: 11, amplitude: 15 },
      { char: '🔧', size: 32, startX: 70, delay: 0.8, duration: 13, amplitude: 22 },
      { char: '⚙️', size: 52, startX: 85, delay: 2,   duration: 8,  amplitude: 10 },
      { char: '🔩', size: 24, startX: 48, delay: 4,   duration: 14, amplitude: 16 },
      { char: '🛢️', size: 34, startX: 92, delay: 1.5, duration: 10, amplitude: 14 },
    ],
  },
  ocean: {
    gradient: `
      radial-gradient(ellipse at 50% 100%, rgba(72,201,176,0.12) 0%, transparent 50%),
      radial-gradient(circle at 5%  50%,  rgba(26,82,118,0.14)   0%, transparent 40%)
    `,
    bubbles: [
      { char: '🌊', size: 48, startX: 5,  delay: 0,   duration: 10, amplitude: 20 },
      { char: '🐚', size: 34, startX: 18, delay: 1.5, duration: 13, amplitude: 15 },
      { char: '🐠', size: 40, startX: 30, delay: 0.5, duration: 9,  amplitude: 25 },
      { char: '⚓', size: 38, startX: 45, delay: 3,   duration: 12, amplitude: 10 },
      { char: '🦈', size: 44, startX: 60, delay: 2,   duration: 11, amplitude: 18 },
      { char: '🐙', size: 36, startX: 75, delay: 4,   duration: 14, amplitude: 22 },
      { char: '🌊', size: 30, startX: 88, delay: 1,   duration: 8,  amplitude: 12 },
      { char: '🐟', size: 28, startX: 52, delay: 2.8, duration: 15, amplitude: 20 },
    ],
  },
  sakura: {
    gradient: `
      radial-gradient(circle at 25% 25%, rgba(248,164,200,0.12) 0%, transparent 45%),
      radial-gradient(circle at 75% 75%, rgba(212,115,154,0.10) 0%, transparent 40%)
    `,
    bubbles: [
      { char: '🌸', size: 44, startX: 7,  delay: 0,   duration: 11, amplitude: 18 },
      { char: '🌸', size: 28, startX: 22, delay: 1.8, duration: 14, amplitude: 14 },
      { char: '🌺', size: 38, startX: 38, delay: 0.7, duration: 9,  amplitude: 20 },
      { char: '🎋', size: 42, startX: 55, delay: 3.2, duration: 12, amplitude: 10 },
      { char: '🌸', size: 34, startX: 68, delay: 1.4, duration: 13, amplitude: 22 },
      { char: '🦋', size: 36, startX: 82, delay: 2.6, duration: 10, amplitude: 16 },
      { char: '🌸', size: 24, startX: 45, delay: 4.1, duration: 15, amplitude: 18 },
      { char: '🍃', size: 30, startX: 93, delay: 0.3, duration: 8,  amplitude: 12 },
    ],
  },
  'neon-noir': {
    gradient: `
      radial-gradient(circle at 30% 70%, rgba(191,90,242,0.12) 0%, transparent 40%),
      radial-gradient(circle at 70% 30%, rgba(48,209,88,0.07)  0%, transparent 35%)
    `,
    bubbles: [
      { char: '🔮', size: 46, startX: 6,  delay: 0,   duration: 10, amplitude: 15 },
      { char: '💜', size: 30, startX: 20, delay: 2,   duration: 13, amplitude: 20 },
      { char: '✨', size: 36, startX: 35, delay: 1,   duration: 9,  amplitude: 18 },
      { char: '💎', size: 40, startX: 50, delay: 3.5, duration: 12, amplitude: 12 },
      { char: '🌙', size: 44, startX: 65, delay: 0.8, duration: 11, amplitude: 22 },
      { char: '⚡', size: 34, startX: 80, delay: 2.4, duration: 14, amplitude: 16 },
      { char: '🔮', size: 26, startX: 44, delay: 4,   duration: 8,  amplitude: 14 },
      { char: '💫', size: 32, startX: 91, delay: 1.6, duration: 15, amplitude: 10 },
    ],
  },
  terracota: {
    gradient: `
      radial-gradient(circle at 80% 90%, rgba(224,122,58,0.12) 0%, transparent 45%),
      radial-gradient(circle at 10% 20%, rgba(139,94,60,0.10)  0%, transparent 40%)
    `,
    bubbles: [
      { char: '🏺', size: 46, startX: 8,  delay: 0,   duration: 11, amplitude: 14 },
      { char: '🏛️', size: 38, startX: 22, delay: 1.7, duration: 9,  amplitude: 18 },
      { char: '☀️', size: 42, startX: 38, delay: 0.9, duration: 13, amplitude: 20 },
      { char: '🪨', size: 30, startX: 54, delay: 3,   duration: 10, amplitude: 12 },
      { char: '🌵', size: 36, startX: 68, delay: 2.2, duration: 12, amplitude: 16 },
      { char: '🏺', size: 28, startX: 82, delay: 4.1, duration: 14, amplitude: 22 },
      { char: '🦎', size: 34, startX: 46, delay: 1.3, duration: 8,  amplitude: 10 },
      { char: '🪶', size: 32, startX: 93, delay: 0.5, duration: 15, amplitude: 18 },
    ],
  },
};

/* ─── Individual animated bubble ─────────────────────────────────────────── */
function FloatingBubble({ char, size, startX, delay, duration, amplitude }) {
  const style = {
    position: 'fixed',
    bottom: '-80px',
    left: `${startX}%`,
    fontSize: `${size}px`,
    lineHeight: 1,
    pointerEvents: 'none',
    zIndex: 0,
    userSelect: 'none',
    animation: `bubbleFloat ${duration}s ease-in-out ${delay}s infinite`,
    '--amplitude': `${amplitude}px`,
    '--duration': `${duration}s`,
  };
  return <span style={style} role="presentation">{char}</span>;
}

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function ThemeDecorations() {
  const { currentTheme } = useTheme();

  const imgDecorations = THEME_DECORATIONS[currentTheme] || [];
  const cssDeco        = BUBBLE_CONFIGS[currentTheme];

  if (imgDecorations.length === 0 && !cssDeco) return null;

  return (
    <>
      {/* Inject keyframes once via a style tag */}
      <style>{`
        @keyframes bubbleFloat {
          0%   { transform: translateY(0)          translateX(0);                  opacity: 0; }
          5%   { opacity: 0.55; }
          50%  { transform: translateY(-45vh)       translateX(var(--amplitude));  opacity: 0.45; }
          100% { transform: translateY(-105vh)      translateX(0);                  opacity: 0; }
        }
      `}</style>

      <div aria-hidden="true" className="theme-decorations">
        {/* ── Image-based decorations (existing themes) ── */}
        {imgDecorations.map((deco, i) => (
          <img
            key={`${currentTheme}-img-${i}`}
            src={deco.src}
            alt={deco.alt}
            style={deco.style}
            loading="lazy"
          />
        ))}

        {/* ── CSS gradient background overlay (new themes) ── */}
        {cssDeco && (
          <div
            key={`${currentTheme}-gradient`}
            style={{
              position: 'fixed',
              inset: 0,
              background: cssDeco.gradient,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {/* ── Floating emoji bubbles (new themes) ── */}
        {cssDeco?.bubbles?.map((b, i) => (
          <FloatingBubble key={`${currentTheme}-bubble-${i}`} {...b} />
        ))}
      </div>
    </>
  );
}
