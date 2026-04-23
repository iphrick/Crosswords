// components/game/ClueLabel.jsx
import styles from './CrosswordBoard.module.css';

export default function ClueLabel({ 
  word, 
  isSelected, 
  onClick 
}) {
  const { number, direction, clue, col, row } = word;
  
  // Position logic: 
  // Across: Left of the first cell
  // Down: Above the first cell
  const isAcross = direction === 'across';
  
  return (
    <div 
      className={`
        ${styles.clueLabel} 
        ${isAcross ? styles.acrossLabel : styles.downLabel}
        ${isSelected ? styles.selectedLabel : ''}
      `}
      style={{
        gridColumn: col + 1,
        gridRow: row + 1,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(word);
      }}
    >
      <div className={styles.clueIndicator}>
        <span className={styles.clueNumber}>{number}</span>
        <span className={styles.clueArrow}>{isAcross ? '→' : '↓'}</span>
      </div>
      
      {isSelected && (
        <div className={styles.clueTooltip}>
          <p className={styles.clueText}>{clue}</p>
        </div>
      )}
    </div>
  );
}
