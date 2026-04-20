// components/game/CrosswordBoard.jsx
import { useRef, useEffect, useCallback, useState } from 'react';
import { GRID_SIZE } from '@/lib/crosswordEngine';
import CluesPanel from './CluesPanel';
import styles from './CrosswordBoard.module.css';

const CLASSES = {
  BLOCKED:   'grid__cell--blocked',
  ACTIVE:    'grid__cell--active',
  NUMBER:    'grid__cell__number',
  INPUT:     'grid__cell__input',
  CORRECT:   'grid__cell__input--correct',
  WRONG:     'grid__cell__input--wrong',
  REVEALED:  'grid__cell__input--revealed',
  HINT:      'grid__cell__input--hint',
  HIGHLIGHT: 'grid__cell__input--highlight',
  SOLVED:    'clues__item--solved',
  SELECTED:  'clues__item--selected',
};

export default function CrosswordBoard({ placedWords, onSolved }) {
  const gridRef      = useRef(null);
  const activeWordRef = useRef(null);
  const directionRef  = useRef('across');
  const [activeNumber, setActiveNumber] = useState(null);
  const [activeDir,    setActiveDir]    = useState('across');

  // Build grid DOM
  useEffect(() => {
    if (!gridRef.current || !placedWords?.length) return;
    const grid = gridRef.current;
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, minmax(28px, 34px))`;
    grid.style.gridAutoRows = 'minmax(28px, 34px)';

    // Create cells
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const cell = document.createElement('div');
      cell.className = `grid__cell ${CLASSES.BLOCKED}`;
      grid.appendChild(cell);
    }

    // Place words
    placedWords.forEach(({ answer, col, row, direction, number }) => {
      for (let i = 0; i < answer.length; i++) {
        const x    = direction === 'across' ? col + i : col;
        const y    = direction === 'across' ? row     : row + i;
        const cell = grid.children[y * GRID_SIZE + x];
        if (!cell) continue;

        cell.classList.remove(CLASSES.BLOCKED);

        if (!cell.querySelector('input')) {
          const inp = document.createElement('input');
          inp.type = 'text'; inp.maxLength = 1; inp.autocomplete = 'off'; inp.spellcheck = false;
          inp.className = CLASSES.INPUT;
          inp.dataset.answer = answer[i];
          cell.appendChild(inp);
        }
        if (i === 0 && !cell.querySelector(`.${CLASSES.NUMBER}`)) {
          const num = document.createElement('span');
          num.className = CLASSES.NUMBER;
          num.textContent = number;
          cell.prepend(num);
        }
      }
    });

    // Focus first input
    const firstInput = grid.querySelector(`.${CLASSES.INPUT}`);
    if (firstInput) {
      const coords = getCoordsFromInput(firstInput, grid);
      handleCellFocus(firstInput, coords, false, grid, placedWords, activeWordRef, directionRef);
    }
  }, [placedWords]);

  // Check all solved
  const checkAllSolved = useCallback((grid, words) => {
    if (!words?.length) return;
    const allSolved = words.every(w => isWordSolved(w, grid));
    if (allSolved) onSolved?.();
  }, [onSolved]);

  // Attach event listeners
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !placedWords?.length) return;

    function onInput(e) {
      const inp = e.target.closest(`.${CLASSES.INPUT}`);
      if (!inp) return;
      checkInput(inp);
      if (inp.value.toUpperCase() === inp.dataset.answer) advanceFocus(inp, grid, activeWordRef);
      updateClueStates(grid, placedWords);
      checkAllSolved(grid, placedWords);
    }

    function onKeydown(e) {
      const inp = e.target.closest(`.${CLASSES.INPUT}`);
      if (!inp) return;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        moveFocusWithArrows(inp, e.key, grid);
        return;
      }
      if (e.key === 'Backspace' && inp.value === '' && activeWordRef.current) {
        moveFocus(inp, -1, grid, activeWordRef);
      }
    }

    function onFocusin(e) {
      const inp = e.target.closest(`.${CLASSES.INPUT}`);
      if (!inp) return;
      const coords = getCoordsFromInput(inp, grid);
      handleCellFocus(inp, coords, false, grid, placedWords, activeWordRef, directionRef);
    }

    function onClick(e) {
      const inp = e.target.closest(`.${CLASSES.INPUT}`);
      if (!inp) return;
      const coords = getCoordsFromInput(inp, grid);
      handleCellFocus(inp, coords, true, grid, placedWords, activeWordRef, directionRef);
    }

    grid.addEventListener('input',   onInput);
    grid.addEventListener('keydown', onKeydown);
    grid.addEventListener('focusin', onFocusin);
    grid.addEventListener('click',   onClick);

    return () => {
      grid.removeEventListener('input',   onInput);
      grid.removeEventListener('keydown', onKeydown);
      grid.removeEventListener('focusin', onFocusin);
      grid.removeEventListener('click',   onClick);
    };
  }, [placedWords, checkAllSolved]);

  // Public methods via ref
  const revealAll = useCallback(async () => {
    const grid = gridRef.current;
    if (!grid) return;
    const inputs = grid.querySelectorAll(`.${CLASSES.INPUT}:not([readOnly])`);
    for (const inp of inputs) {
      inp.value = inp.dataset.answer;
      inp.readOnly = true;
      inp.classList.remove(CLASSES.CORRECT, CLASSES.WRONG);
      inp.classList.add(CLASSES.REVEALED);
      await new Promise(r => setTimeout(r, 35));
    }
    updateClueStates(grid, placedWords);
  }, [placedWords]);

  const revealHint = useCallback(() => {
    if (!activeWordRef.current) return false;
    const grid = gridRef.current;
    const { answer, col, row, direction } = activeWordRef.current;
    for (let i = 0; i < answer.length; i++) {
      const x = direction === 'across' ? col + i : col;
      const y = direction === 'across' ? row     : row + i;
      const inp = cellAt(x, y, grid)?.querySelector('input');
      if (inp && !inp.readOnly && inp.value.toUpperCase() !== answer[i]) {
        inp.value = answer[i];
        inp.classList.add(CLASSES.HINT);
        checkInput(inp);
        updateClueStates(grid, placedWords);
        return true;
      }
    }
    return false;
  }, [placedWords]);

  const clearAll = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    grid.querySelectorAll(`.${CLASSES.INPUT}`).forEach(inp => {
      if (inp.readOnly) return;
      inp.value = '';
      inp.classList.remove(CLASSES.CORRECT, CLASSES.WRONG, CLASSES.REVEALED, CLASSES.HINT);
    });
    updateClueStates(grid, placedWords);
  }, [placedWords]);

  // Expose methods via window (to be called from parent page)
  useEffect(() => {
    window._crosswordRevealAll  = revealAll;
    window._crosswordRevealHint = revealHint;
    window._crosswordClearAll   = clearAll;
    return () => {
      delete window._crosswordRevealAll;
      delete window._crosswordRevealHint;
      delete window._crosswordClearAll;
    };
  }, [revealAll, revealHint, clearAll]);

  // Clue click handler
  const handleClueClick = useCallback((number, direction) => {
    const grid = gridRef.current;
    if (!grid) return;
    const word = placedWords.find(w => w.number === number && w.direction === direction);
    if (!word) return;
    setActiveWord(word, grid, activeWordRef, directionRef);
    setActiveNumber(number);
    setActiveDir(direction);
    const inp = cellAt(word.col, word.row, grid)?.querySelector('input');
    inp?.focus();
  }, [placedWords]);

  return (
    <div className={styles.board}>
      <div className={styles.gridWrapper}>
        <div
          ref={gridRef}
          className="grid"
          role="grid"
          aria-label="Grade da cruzadinha"
        />
        <div className={styles.actions} id="crossword-actions">
          <slot name="actions" />
        </div>
      </div>
      <CluesPanel
        placedWords={placedWords}
        activeNumber={activeNumber}
        activeDir={activeDir}
        onClueClick={handleClueClick}
      />
    </div>
  );
}

/* ---- helpers (imperative DOM — same logic as original script.js) ---- */
function cellAt(col, row, grid) {
  return grid.children[row * GRID_SIZE + col] || null;
}

function getCoordsFromInput(inp, grid) {
  const cell  = inp.closest('.grid__cell');
  const index = [...grid.children].indexOf(cell);
  return index === -1 ? { col: 0, row: 0 } : { col: index % GRID_SIZE, row: Math.floor(index / GRID_SIZE) };
}

function getCoordsForIndex(word, i) {
  return {
    col: word.direction === 'across' ? word.col + i : word.col,
    row: word.direction === 'across' ? word.row     : word.row + i,
  };
}

function isCoordInWord(word, col, row) {
  if (word.direction === 'across') return row === word.row && col >= word.col && col < word.col + word.answer.length;
  return col === word.col && row >= word.row && row < word.row + word.answer.length;
}

function checkInput(inp) {
  if (inp.readOnly) return;
  const correct = inp.value.toUpperCase() === inp.dataset.answer;
  inp.classList.toggle(CLASSES.CORRECT, correct && inp.value !== '');
  inp.classList.toggle(CLASSES.WRONG,   !correct && inp.value !== '');
}

function setActiveWord(word, grid, activeWordRef, directionRef) {
  activeWordRef.current   = word;
  directionRef.current    = word.direction;
  document.querySelectorAll(`.${CLASSES.SELECTED}`).forEach(el => el.classList.remove(CLASSES.SELECTED));
  const clue = document.querySelector(`.clues__item[data-number="${word.number}"][data-direction="${word.direction}"]`);
  clue?.classList.add(CLASSES.SELECTED);
  clue?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  highlightWord(word, grid);
}

function highlightWord(word, grid) {
  document.querySelectorAll(`.${CLASSES.HIGHLIGHT}`).forEach(el => el.classList.remove(CLASSES.HIGHLIGHT));
  if (!word) return;
  for (let i = 0; i < word.answer.length; i++) {
    const { col, row } = getCoordsForIndex(word, i);
    cellAt(col, row, grid)?.querySelector('input')?.classList.add(CLASSES.HIGHLIGHT);
  }
}

function handleCellFocus(inp, { col, row }, forceToggle, grid, placedWords, activeWordRef, directionRef) {
  const wordsAt   = placedWords.filter(w => isCoordInWord(w, col, row));
  if (!wordsAt.length) return;
  const acrossWord = wordsAt.find(w => w.direction === 'across');
  const downWord   = wordsAt.find(w => w.direction === 'down');
  let dir = directionRef.current;
  let active = activeWordRef.current;

  if (forceToggle && active && isCoordInWord(active, col, row) && acrossWord && downWord) {
    dir = dir === 'across' ? 'down' : 'across';
  }

  if (dir === 'across' && acrossWord) active = acrossWord;
  else if (dir === 'down' && downWord) active = downWord;
  else active = acrossWord || downWord;

  setActiveWord(active, grid, activeWordRef, directionRef);
}

function advanceFocus(inp, grid, activeWordRef) { moveFocus(inp, 1, grid, activeWordRef); }

function moveFocus(inp, delta, grid, activeWordRef) {
  if (!activeWordRef.current) return;
  const { col, row } = getCoordsFromInput(inp, grid);
  const w = activeWordRef.current;
  const cur = w.direction === 'across' ? col - w.col : row - w.row;
  const next = cur + delta;
  if (next >= 0 && next < w.answer.length) {
    const { col: nc, row: nr } = getCoordsForIndex(w, next);
    cellAt(nc, nr, grid)?.querySelector('input')?.focus();
  }
}

function moveFocusWithArrows(inp, key, grid) {
  let { col, row } = getCoordsFromInput(inp, grid);
  if (key === 'ArrowUp')    row--;
  if (key === 'ArrowDown')  row++;
  if (key === 'ArrowLeft')  col--;
  if (key === 'ArrowRight') col++;
  if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
    cellAt(col, row, grid)?.querySelector('input')?.focus();
  }
}

function isWordSolved(word, grid) {
  for (let i = 0; i < word.answer.length; i++) {
    const { col, row } = getCoordsForIndex(word, i);
    const inp = cellAt(col, row, grid)?.querySelector('input');
    if (!inp || inp.value.toUpperCase() !== word.answer[i]) return false;
  }
  return true;
}

function updateClueStates(grid, placedWords) {
  placedWords.forEach(word => {
    const solved = isWordSolved(word, grid);
    const clue   = document.querySelector(`.clues__item[data-number="${word.number}"][data-direction="${word.direction}"]`);
    clue?.classList.toggle(CLASSES.SOLVED, solved);
  });
}
