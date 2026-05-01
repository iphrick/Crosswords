// components/game/CrosswordBoard.jsx
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GRID_SIZE } from '@/lib/crosswordEngine';
import CrosswordCell from './CrosswordCell';
import styles from './CrosswordBoard.module.css';

export default function CrosswordBoard({ placedWords, onSolved }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [cellFeedback, setCellFeedback] = useState({});
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const [activeCell, setActiveCell] = useState({ x: -1, y: -1 });
  const [direction, setDirection] = useState('across');
  const [isMounted, setIsMounted] = useState(false);

  const inputRefs = useRef({});
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const gridMap = useMemo(() => {
    const map = {};
    placedWords.forEach((word) => {
      const { answer, col, row, direction, number } = word;
      for (let i = 0; i < answer.length; i++) {
        const x = direction === 'across' ? col + i : col;
        const y = direction === 'across' ? row : row + i;
        const key = `${x},${y}`;
        if (!map[key]) {
          map[key] = { answer: answer[i], words: [], isFirst: false, number: null };
        }
        map[key].words.push(word);
        if (i === 0) {
          map[key].isFirst = true;
          map[key].number = number;
        }
      }
    });
    return map;
  }, [placedWords]);

  const activeWord = useMemo(() => {
    if (activeWordIndex === null) return null;
    return placedWords[activeWordIndex];
  }, [activeWordIndex, placedWords]);

  const gridBounds = useMemo(() => {
    if (!placedWords.length) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    let minX = GRID_SIZE, maxX = 0, minY = GRID_SIZE, maxY = 0;
    placedWords.forEach(w => {
      const { col, row, answer, direction } = w;
      minX = Math.min(minX, col);
      minY = Math.min(minY, row);
      if (direction === 'across') {
        maxX = Math.max(maxX, col + answer.length - 1);
        maxY = Math.max(maxY, row);
      } else {
        maxX = Math.max(maxX, col);
        maxY = Math.max(maxY, row + answer.length - 1);
      }
    });
    const pad = 2;
    return {
      minX: Math.max(0, minX - pad),
      maxX: Math.min(GRID_SIZE - 1, maxX + pad),
      minY: Math.max(0, minY - pad),
      maxY: Math.min(GRID_SIZE - 1, maxY + pad)
    };
  }, [placedWords]);

  const gridDimensions = {
    cols: gridBounds.maxX - gridBounds.minX + 1,
    rows: gridBounds.maxY - gridBounds.minY + 1
  };

  const getCellKey = (x, y) => `${x},${y}`;

  const checkWordSolved = useCallback((word, currentAnswers) => {
    for (let i = 0; i < word.answer.length; i++) {
      const x = word.direction === 'across' ? word.col + i : word.col;
      const y = word.direction === 'across' ? word.row : word.row + i;
      const key = getCellKey(x, y);
      if (currentAnswers[key] !== word.answer[i]) return false;
    }
    return true;
  }, []);

  const handleInput = useCallback((x, y, char) => {
    const key = getCellKey(x, y);
    const correctChar = gridMap[key]?.answer;
    const newUserAnswers = { ...userAnswers, [key]: char };
    setUserAnswers(newUserAnswers);
    if (char) {
      setCellFeedback(prev => ({ ...prev, [key]: char === correctChar ? 'correct' : 'wrong' }));
      if (char === correctChar) moveToNextCell(x, y);
    } else {
      setCellFeedback(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  }, [userAnswers, gridMap]);

  useEffect(() => {
    if (placedWords.length > 0 && placedWords.every(w => checkWordSolved(w, userAnswers))) {
      onSolved?.();
    }
  }, [userAnswers, placedWords, checkWordSolved, onSolved]);

  const moveToNextCell = (x, y) => {
    if (!activeWord) return;
    const { answer, col, row, direction } = activeWord;
    const index = direction === 'across' ? x - col : y - row;
    if (index < answer.length - 1) {
      const nextX = direction === 'across' ? x + 1 : x;
      const nextY = direction === 'across' ? y : y + 1;
      inputRefs.current[`${nextX},${nextY}`]?.focus();
    }
  };

  const moveToPrevCell = (x, y) => {
    if (!activeWord) return;
    const { col, row, direction } = activeWord;
    const index = direction === 'across' ? x - col : y - row;
    if (index > 0) {
      const prevX = direction === 'across' ? x - 1 : x;
      const prevY = direction === 'across' ? y : y - 1;
      inputRefs.current[`${prevX},${prevY}`]?.focus();
    }
  };

  const handleKeyDown = (e, x, y) => {
    if (e.key === 'Backspace' && !userAnswers[getCellKey(x, y)]) {
      e.preventDefault(); 
      moveToPrevCell(x, y);
    } else if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      const dx = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      const dy = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
      
      // Procura a próxima célula válida naquela direção (até 20 células de distância)
      let nextX = x + dx;
      let nextY = y + dy;
      let found = false;
      for (let i = 0; i < 20; i++) {
        if (gridMap[`${nextX},${nextY}`]) {
          found = true;
          break;
        }
        nextX += dx;
        nextY += dy;
      }
      
      if (found) {
        inputRefs.current[`${nextX},${nextY}`]?.focus();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const step = e.shiftKey ? -1 : 1;
      const nextIndex = (activeWordIndex + step + placedWords.length) % placedWords.length;
      selectWord(placedWords[nextIndex]);
    }
  };

  const selectWord = (word) => {
    const index = placedWords.indexOf(word);
    setActiveWordIndex(index);
    setDirection(word.direction);
    setActiveCell({ x: word.col, y: word.row });
    inputRefs.current[`${word.col},${word.row}`]?.focus();
  };

  const handleCellClick = (x, y) => {
    const key = getCellKey(x, y);
    const cellWords = gridMap[key]?.words || [];
    if (cellWords.length === 0) return;
    let targetWord = cellWords[0];
    if (activeCell.x === x && activeCell.y === y && cellWords.length > 1) {
      const nextDir = direction === 'across' ? 'down' : 'across';
      targetWord = cellWords.find(w => w.direction === nextDir) || cellWords[0];
    } else if (cellWords.length > 1) {
      targetWord = cellWords.find(w => w.direction === direction) || cellWords[0];
    }
    selectWord(targetWord);
  };

  useEffect(() => {
    window._crosswordRevealAll = () => {
      const allAnswers = {}; const allFeedback = {};
      placedWords.forEach(w => {
        for (let i = 0; i < w.answer.length; i++) {
          const x = w.direction === 'across' ? w.col + i : w.col;
          const y = w.direction === 'across' ? w.row : w.row + i;
          const key = `${x},${y}`; allAnswers[key] = w.answer[i]; allFeedback[key] = 'revealed';
        }
      });
      setUserAnswers(allAnswers); setCellFeedback(allFeedback);
    };
    window._crosswordRevealHint = () => {
      if (!activeWord) return false;
      for (let i = 0; i < activeWord.answer.length; i++) {
        const x = activeWord.direction === 'across' ? activeWord.col + i : activeWord.col;
        const y = activeWord.direction === 'across' ? activeWord.row : activeWord.row + i;
        const key = `${x},${y}`;
        if (userAnswers[key] !== activeWord.answer[i]) {
          setUserAnswers(prev => ({ ...prev, [key]: activeWord.answer[i] }));
          setCellFeedback(prev => ({ ...prev, [key]: 'hint' }));
          return true;
        }
      }
      return false;
    };
    window._crosswordClearAll = () => { setUserAnswers({}); setCellFeedback({}); };
    return () => { delete window._crosswordRevealAll; delete window._crosswordRevealHint; delete window._crosswordClearAll; };
  }, [activeWord, placedWords, userAnswers]);

  useEffect(() => {
    if (placedWords.length > 0 && activeWordIndex === null) selectWord(placedWords[0]);
  }, [placedWords]);

  if (!isMounted) return <div className={styles.board} style={{ minHeight: '400px' }} />;

  return (
    <div className={styles.board}>
      <div className={styles.gridWrapper}>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-6 mb-4 bg-gradient-to-r from-transparent via-slate-800/50 to-transparent">
          {['⚖️', '🔨', '📜', '👨‍⚖️', '🏛️', '💼', '🖋️'].map((icon, i) => (
            <div key={i} className="relative group cursor-default">
              {/* Outer glowing aura */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#c9a96e] to-yellow-600 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              
              {/* Realistic Coin-like Container */}
              <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border-[2px] border-slate-600/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_10px_20px_rgba(0,0,0,0.6)] group-hover:shadow-[inset_0_4px_8px_rgba(255,255,255,0.3),0_15px_30px_rgba(201,169,110,0.4)] group-hover:border-[#c9a96e]/70 transform group-hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden">
                
                {/* Inner glass reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 rounded-full pointer-events-none"></div>

                <span 
                  className="text-4xl sm:text-5xl filter saturate-150 contrast-125 drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] transform group-hover:scale-110 transition-transform duration-500"
                >
                  {icon}
                </span>
              </div>
            </div>
          ))}
        </div>

        {activeWord && (
          <div className="hidden lg:flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl mb-4 animate-in fade-in slide-in-from-top-2">
            <div className="bg-emerald-500 text-slate-900 font-extrabold px-3 py-1 rounded-lg text-sm">
              {activeWord.number} {activeWord.direction === 'across' ? '→' : '↓'}
            </div>
            <p className="text-emerald-100 font-medium text-lg leading-tight">{activeWord.clue}</p>
          </div>
        )}

        <div className={styles.gridScroll}>
          <div 
            className={styles.grid}
            style={{ 
              gridTemplateColumns: `repeat(${gridDimensions.cols}, ${windowWidth < 1280 ? '44px' : '52px'})`,
              gridTemplateRows: `repeat(${gridDimensions.rows}, ${windowWidth < 1280 ? '44px' : '52px'})`
            }}
          >

            {Array.from({ length: gridDimensions.rows }).map((_, yIdx) => {
              const y = yIdx + gridBounds.minY;
              return Array.from({ length: gridDimensions.cols }).map((_, xIdx) => {
                const x = xIdx + gridBounds.minX;
                const key = getCellKey(x, y);
                const data = gridMap[key];
                return (
                  <CrosswordCell
                    key={key}
                    isBlocked={!data}
                    answer={data?.answer}
                    value={userAnswers[key] || ''}
                    number={data?.number}
                    isActive={activeCell.x === x && activeCell.y === y}
                    isHighlighted={activeWord && data?.words.some(w => w === activeWord)}
                    isCorrect={cellFeedback[key] === 'correct'}
                    isWrong={cellFeedback[key] === 'wrong'}
                    isRevealed={cellFeedback[key] === 'revealed'}
                    isHint={cellFeedback[key] === 'hint'}
                    activeDirection={direction}
                    activeClue={activeCell.x === x && activeCell.y === y ? activeWord?.clue : null}
                    gridBounds={gridBounds}
                    onInput={(char) => handleInput(x, y, char)}
                    onKeyDown={(e) => handleKeyDown(e, x, y)}
                    onFocus={() => {
              setActiveCell({ x, y });
              // Scroll into view on mobile to avoid keyboard overlap
              if (windowWidth < 768) {
                inputRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
              }
            }}
                    onClick={() => handleCellClick(x, y)}
                    inputRef={(el) => (inputRefs.current[key] = el)}
                  />
                );
              });
            })}
            
          </div>
        </div>
      </div>
    </div>
  );
}
