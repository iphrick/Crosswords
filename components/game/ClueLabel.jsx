// components/game/ClueLabel.jsx
import styles from './CrosswordBoard.module.css';

export default function ClueLabel({ 
  word, 
  isSelected, 
  onClick,
  gridBounds
}) {
  const { number, direction, clue, col, row } = word;
  
  // Position logic: 
  // Across: Left of the first cell
  // Down: Above the first cell
  const isAcross = direction === 'across';

  // Smart alignment to prevent clipping
  const relCol = col - (gridBounds?.minX || 0);
  const totalCols = (gridBounds?.maxX || 0) - (gridBounds?.minX || 0);
  
  let tooltipClass = styles.tooltipCenter;
  if (relCol < 4) tooltipClass = styles.tooltipLeft;
  else if (totalCols - relCol < 4) tooltipClass = styles.tooltipRight;
  
  return (
    <div 
      className={`
        ${styles.clueLabel} 
        ${isAcross ? styles.acrossLabel : styles.downLabel}
        ${isSelected ? styles.selectedLabel : ''}
      `}
      style={{
        gridColumn: col - (gridBounds?.minX || 0) + 1,
        gridRow: row - (gridBounds?.minY || 0) + 1,
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
        <div className={`${styles.clueTooltip} ${tooltipClass}`}>
          <p className={styles.clueText}>{clue}</p>
        </div>
      )}
    </div>
  );
}
