// components/layout/ThemeDecorations.jsx
import { useTheme } from '@/context/ThemeContext';

const THEME_DECORATIONS = {
  default: [],
  'world-cup': [
    { src: '/themes/worldcup-trophy.png', alt: 'Taça', style: { position: 'fixed', bottom: '-30px', right: '-20px', width: '260px', opacity: 0.12, pointerEvents: 'none', zIndex: 0, transform: 'rotate(-10deg)' } },
    { src: '/themes/worldcup-ball.png', alt: 'Bola', style: { position: 'fixed', top: '100px', left: '-40px', width: '180px', opacity: 0.08, pointerEvents: 'none', zIndex: 0, transform: 'rotate(15deg)' } },
    { src: '/themes/worldcup-flag.png', alt: 'Bandeira', style: { position: 'fixed', top: '-20px', right: '10%', width: '220px', opacity: 0.1, pointerEvents: 'none', zIndex: 0 } },
  ],
  cyberpunk: [
    { src: '/themes/cyberpunk-circuit.png', alt: 'Circuito', style: { position: 'fixed', bottom: '-60px', left: '-60px', width: '400px', opacity: 0.08, pointerEvents: 'none', zIndex: 0, transform: 'rotate(-20deg)' } },
    { src: '/themes/cyberpunk-circuit.png', alt: 'Circuito', style: { position: 'fixed', top: '-60px', right: '-60px', width: '350px', opacity: 0.06, pointerEvents: 'none', zIndex: 0, transform: 'rotate(160deg)' } },
  ],
  forest: [
    { src: '/themes/forest-leaves.png', alt: 'Folhas', style: { position: 'fixed', top: '-40px', left: '-40px', width: '350px', opacity: 0.1, pointerEvents: 'none', zIndex: 0, transform: 'rotate(-5deg)' } },
    { src: '/themes/forest-leaves.png', alt: 'Folhas', style: { position: 'fixed', bottom: '-60px', right: '-60px', width: '400px', opacity: 0.08, pointerEvents: 'none', zIndex: 0, transform: 'rotate(180deg)' } },
  ],
  royal: [
    { src: '/themes/royal-crown.png', alt: 'Coroa', style: { position: 'fixed', top: '80px', right: '-30px', width: '220px', opacity: 0.1, pointerEvents: 'none', zIndex: 0, transform: 'rotate(10deg)' } },
    { src: '/themes/royal-crown.png', alt: 'Coroa', style: { position: 'fixed', bottom: '-20px', left: '-30px', width: '200px', opacity: 0.06, pointerEvents: 'none', zIndex: 0, transform: 'rotate(-15deg) scaleX(-1)' } },
  ],
};

// CSS-based decorations for themes without image assets
const CSS_DECORATIONS = {
  steampunk: {
    background: `
      radial-gradient(circle at 10% 90%, rgba(139,105,20,0.12) 0%, transparent 50%),
      radial-gradient(circle at 90% 10%, rgba(205,133,63,0.08) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(139,105,20,0.04) 0%, transparent 60%)
    `,
    emojis: [
      { char: '⚙️', style: { position: 'fixed', bottom: '40px', right: '30px', fontSize: '120px', opacity: 0.06, pointerEvents: 'none', zIndex: 0, transform: 'rotate(-15deg)' } },
      { char: '🔩', style: { position: 'fixed', top: '120px', left: '20px', fontSize: '80px', opacity: 0.05, pointerEvents: 'none', zIndex: 0, transform: 'rotate(25deg)' } },
      { char: '⏱️', style: { position: 'fixed', top: '60px', right: '15%', fontSize: '60px', opacity: 0.04, pointerEvents: 'none', zIndex: 0, transform: 'rotate(-10deg)' } },
    ],
  },
  ocean: {
    background: `
      radial-gradient(ellipse at 50% 100%, rgba(72,201,176,0.1) 0%, transparent 50%),
      radial-gradient(circle at 0% 50%, rgba(26,82,118,0.12) 0%, transparent 40%),
      radial-gradient(circle at 100% 0%, rgba(93,173,226,0.06) 0%, transparent 40%)
    `,
    emojis: [
      { char: '🌊', style: { position: 'fixed', bottom: '-10px', left: '5%', fontSize: '100px', opacity: 0.07, pointerEvents: 'none', zIndex: 0 } },
      { char: '🐚', style: { position: 'fixed', bottom: '60px', right: '40px', fontSize: '70px', opacity: 0.05, pointerEvents: 'none', zIndex: 0, transform: 'rotate(-20deg)' } },
      { char: '⚓', style: { position: 'fixed', top: '100px', left: '30px', fontSize: '80px', opacity: 0.04, pointerEvents: 'none', zIndex: 0, transform: 'rotate(15deg)' } },
    ],
  },
  sakura: {
    background: `
      radial-gradient(circle at 20% 20%, rgba(248,164,200,0.1) 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, rgba(212,115,154,0.08) 0%, transparent 40%),
      radial-gradient(circle at 50% 0%, rgba(248,164,200,0.05) 0%, transparent 50%)
    `,
    emojis: [
      { char: '🌸', style: { position: 'fixed', top: '60px', right: '30px', fontSize: '90px', opacity: 0.07, pointerEvents: 'none', zIndex: 0, transform: 'rotate(-10deg)' } },
      { char: '🌸', style: { position: 'fixed', bottom: '100px', left: '20px', fontSize: '60px', opacity: 0.05, pointerEvents: 'none', zIndex: 0, transform: 'rotate(20deg)' } },
      { char: '🎋', style: { position: 'fixed', bottom: '-20px', right: '10%', fontSize: '110px', opacity: 0.04, pointerEvents: 'none', zIndex: 0 } },
      { char: '🌸', style: { position: 'fixed', top: '40%', left: '8%', fontSize: '40px', opacity: 0.06, pointerEvents: 'none', zIndex: 0, transform: 'rotate(45deg)' } },
    ],
  },
  'neon-noir': {
    background: `
      radial-gradient(circle at 30% 70%, rgba(191,90,242,0.1) 0%, transparent 40%),
      radial-gradient(circle at 70% 30%, rgba(48,209,88,0.06) 0%, transparent 35%),
      radial-gradient(circle at 50% 50%, rgba(191,90,242,0.03) 0%, transparent 60%)
    `,
    emojis: [
      { char: '🔮', style: { position: 'fixed', bottom: '50px', right: '40px', fontSize: '100px', opacity: 0.06, pointerEvents: 'none', zIndex: 0, transform: 'rotate(-5deg)' } },
      { char: '💎', style: { position: 'fixed', top: '80px', left: '25px', fontSize: '70px', opacity: 0.04, pointerEvents: 'none', zIndex: 0, transform: 'rotate(15deg)' } },
      { char: '✨', style: { position: 'fixed', top: '30%', right: '10%', fontSize: '50px', opacity: 0.05, pointerEvents: 'none', zIndex: 0 } },
    ],
  },
  terracota: {
    background: `
      radial-gradient(circle at 80% 90%, rgba(224,122,58,0.1) 0%, transparent 45%),
      radial-gradient(circle at 10% 20%, rgba(139,94,60,0.08) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(224,122,58,0.03) 0%, transparent 50%)
    `,
    emojis: [
      { char: '🏺', style: { position: 'fixed', bottom: '30px', right: '30px', fontSize: '110px', opacity: 0.06, pointerEvents: 'none', zIndex: 0, transform: 'rotate(-8deg)' } },
      { char: '🏛️', style: { position: 'fixed', top: '80px', left: '20px', fontSize: '80px', opacity: 0.04, pointerEvents: 'none', zIndex: 0 } },
      { char: '☀️', style: { position: 'fixed', top: '60px', right: '15%', fontSize: '60px', opacity: 0.05, pointerEvents: 'none', zIndex: 0, transform: 'rotate(10deg)' } },
    ],
  },
};

export default function ThemeDecorations() {
  const { currentTheme } = useTheme();

  // Image-based decorations (existing themes)
  const imgDecorations = THEME_DECORATIONS[currentTheme] || [];

  // CSS-based decorations (new themes)
  const cssDecoration = CSS_DECORATIONS[currentTheme];

  if (imgDecorations.length === 0 && !cssDecoration) return null;

  return (
    <div aria-hidden="true" className="theme-decorations">
      {/* Image-based decorations */}
      {imgDecorations.map((deco, i) => (
        <img
          key={`${currentTheme}-img-${i}`}
          src={deco.src}
          alt={deco.alt}
          style={deco.style}
          loading="lazy"
        />
      ))}

      {/* CSS gradient overlay */}
      {cssDecoration && (
        <div
          key={`${currentTheme}-gradient`}
          style={{
            position: 'fixed',
            inset: 0,
            background: cssDecoration.background,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Emoji decorations */}
      {cssDecoration?.emojis?.map((emoji, i) => (
        <span
          key={`${currentTheme}-emoji-${i}`}
          style={emoji.style}
          role="presentation"
        >
          {emoji.char}
        </span>
      ))}
    </div>
  );
}
