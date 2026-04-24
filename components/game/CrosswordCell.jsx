import { useRef } from 'react';
import styles from './CrosswordBoard.module.css';
import CrosswordTooltipPortal from './CrosswordTooltipPortal';

export default function CrosswordCell({ 
  x, y, 
  value, 
  answer, 
  isBlocked, 
  number, 
  isActive, 
  isHighlighted, 
  isCorrect, 
  isWrong, 
  isRevealed, 
  isHint, 
  activeDirection,
  activeClue,
  gridBounds,
  onInput, 
  onKeyDown, 
  onFocus, 
  onClick,
  inputRef
}) {
  const cellRef = useRef(null);

  if (isBlocked) {
    return <div className={`${styles.cell} ${styles.blocked}`} />;
  }

  return (
    <div 
      ref={cellRef}
      className={`
        ${styles.cell} 
        ${isActive ? styles.activeCell : ''} 
        ${isHighlighted ? styles.highlightedCell : ''}
      `}
      onClick={onClick}
    >
      {number && <span className={styles.cellNumber}>{number}</span>}
      
      {/* Question Balloon (Portal) */}
      <CrosswordTooltipPortal 
        targetRef={cellRef}
        text={activeClue}
        visible={!!activeClue}
      />

      {isActive && (
        <span className={styles.directionTip}>
          {activeDirection === 'across' ? '→' : '↓'}
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        maxLength={1}
        value={value}
        className={`
          ${styles.input}
          ${isCorrect ? styles.correct : ''}
          ${isWrong ? styles.wrong : ''}
          ${isRevealed ? styles.revealed : ''}
          ${isHint ? styles.hint : ''}
        `}
        onChange={(e) => onInput(e.target.value.toUpperCase())}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
}
