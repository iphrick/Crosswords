// components/game/CrosswordCell.jsx
import styles from './CrosswordBoard.module.css';

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
  onInput, 
  onKeyDown, 
  onFocus, 
  onClick,
  inputRef
}) {
  if (isBlocked) {
    return <div className={`${styles.cell} ${styles.blocked}`} />;
  }

  return (
    <div 
      className={`
        ${styles.cell} 
        ${isActive ? styles.activeCell : ''} 
        ${isHighlighted ? styles.highlightedCell : ''}
      `}
      onClick={onClick}
    >
      {number && <span className={styles.cellNumber}>{number}</span>}
      
      {/* Question Balloon (Tooltip) */}
      {activeClue && (
        <div className={styles.clueTooltip}>
          <div className={styles.tooltipArrow} />
          {activeClue}
        </div>
      )}

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
