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

export default function ThemeDecorations() {
  const { currentTheme } = useTheme();
  const decorations = THEME_DECORATIONS[currentTheme] || [];

  if (decorations.length === 0) return null;

  return (
    <div aria-hidden="true" className="theme-decorations">
      {decorations.map((deco, i) => (
        <img
          key={`${currentTheme}-${i}`}
          src={deco.src}
          alt={deco.alt}
          style={deco.style}
          loading="lazy"
        />
      ))}
    </div>
  );
}
