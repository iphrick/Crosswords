import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CrosswordTooltipPortal({ targetRef, text, visible }) {
  const [coords, setCoords] = useState({ top: 0, left: 0, position: 'top', arrowLeft: '50%' });
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible || !targetRef.current) return;

    const updatePosition = () => {
      const targetRect = targetRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const tooltipWidth = 320; // Max width
      const tooltipHeight = 100; // Estimação inicial
      
      let top = targetRect.top + window.scrollY;
      let left = targetRect.left + window.scrollX + targetRect.width / 2;
      let position = 'top';

      // Verificar espaço acima
      if (targetRect.top < 180) {
        top = targetRect.bottom + window.scrollY;
        position = 'bottom';
      }

      // Ajustar limites laterais (Viewport safety)
      const margin = 16;
      const halfWidth = tooltipWidth / 2;
      const targetCenter = targetRect.left + targetRect.width / 2;
      
      let finalLeft = targetCenter + window.scrollX;

      if (finalLeft - halfWidth < margin) {
        finalLeft = halfWidth + margin;
      } else if (finalLeft + halfWidth > viewportWidth - margin) {
        finalLeft = viewportWidth - margin - halfWidth;
      }

      // Calcular posição da seta relativa ao centro do balão
      const arrowOffset = (targetCenter + window.scrollX) - finalLeft;
      const arrowLeft = `calc(50% + ${arrowOffset}px)`;

      setCoords({ top, left: finalLeft, position, arrowLeft });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [visible, targetRef, text]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={tooltipRef}
          initial={{ 
            opacity: 0, 
            scale: 0.9, 
            y: coords.position === 'top' ? '-80%' : '80%', 
            x: '-50%' 
          }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: coords.position === 'top' ? 'calc(-100% - 25px)' : '25px', 
            x: '-50%' 
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.9, 
            y: coords.position === 'top' ? '-80%' : '80%', 
            x: '-50%' 
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'absolute',
            top: coords.top, 
            left: coords.left,
            zIndex: 1000,
            pointerEvents: 'none',
            transformOrigin: coords.position === 'top' ? 'bottom center' : 'top center',
          }}
        >
          <div style={{
            background: '#c9a96e',
            color: '#0f172a',
            padding: '14px 20px',
            borderRadius: '16px',
            fontSize: '15px',
            fontWeight: '800',
            width: 'max-content',
            maxWidth: 'min(400px, 90vw)',
            minWidth: '240px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            lineHeight: '1.4',
            position: 'relative'
          }}>
            {text}
            
            {/* Seta dinamicamente posicionada para apontar pro centro da célula */}
            <div style={{
              position: 'absolute',
              width: '12px',
              height: '12px',
              background: '#c9a96e',
              left: coords.arrowLeft,
              transform: `translateX(-50%) rotate(45deg)`,
              top: coords.position === 'top' ? 'auto' : '-6px',
              bottom: coords.position === 'top' ? '-6px' : 'auto',
              zIndex: -1
            }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
