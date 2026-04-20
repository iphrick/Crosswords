// lib/crosswordEngine.js
// Pure logic — no DOM. Ported from CrosswordGrid module in script.js.

const GRID_SIZE = 20;
const MAX_ATTEMPTS = 150;

function buildLayout(words) {
  const sortedWords = [...words].sort((a, b) => b.answer.length - a.answer.length);
  const placed = [];
  let grid = createEmptyGrid();

  sortedWords.forEach((wordData) => {
    const answer = wordData.answer.toUpperCase();
    const clue = wordData.question;
    const position = findBestPosition(answer, placed, grid);
    if (position) {
      const newWord = { answer, clue, number: 0, ...position };
      placed.push(newWord);
      grid = addWordToGrid(newWord, grid);
    }
  });

  return assignNumbers(placed, words);
}

function findBestPosition(word, placedWords, grid) {
  if (placedWords.length === 0) {
    const direction = word.length < GRID_SIZE / 2 ? 'across' : 'down';
    const col = Math.floor((GRID_SIZE - word.length) / 2);
    const row = Math.floor(GRID_SIZE / 2);
    const pos = { col, row, direction };
    if (canPlace(word, pos, grid)) return pos;
  }

  const intersection = findIntersection(word, placedWords, grid);
  if (intersection) return intersection;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const direction = Math.random() > 0.5 ? 'across' : 'down';
    const col = Math.floor(Math.random() * (GRID_SIZE - (direction === 'across' ? word.length : 0)));
    const row = Math.floor(Math.random() * (GRID_SIZE - (direction === 'down' ? word.length : 0)));
    const pos = { col, row, direction };
    if (canPlace(word, pos, grid)) return pos;
  }

  return null;
}

function findIntersection(word, placedWords, grid) {
  for (let i = 0; i < word.length; i++) {
    const letter = word[i];
    for (const p of placedWords) {
      for (let j = 0; j < p.answer.length; j++) {
        if (p.answer[j] === letter) {
          const direction = p.direction === 'across' ? 'down' : 'across';
          const row = direction === 'down' ? p.row - i : p.row + j;
          const col = direction === 'across' ? p.col - i : p.col + j;
          const pos = { col, row, direction };
          if (canPlace(word, pos, grid)) return pos;
        }
      }
    }
  }
  return null;
}

function canPlace(word, { col, row, direction }, grid) {
  if (col < 0 || row < 0 ||
    (direction === 'across' && col + word.length > GRID_SIZE) ||
    (direction === 'down' && row + word.length > GRID_SIZE)) return false;

  for (let i = 0; i < word.length; i++) {
    const x = direction === 'across' ? col + i : col;
    const y = direction === 'across' ? row : row + i;
    const gridLetter = grid[y][x];
    if (gridLetter !== null && gridLetter !== word[i]) return false;
    if (gridLetter === null) {
      if (direction === 'across') {
        if ((y > 0 && grid[y - 1][x] !== null) || (y < GRID_SIZE - 1 && grid[y + 1][x] !== null)) return false;
      } else {
        if ((x > 0 && grid[y][x - 1] !== null) || (x < GRID_SIZE - 1 && grid[y][x + 1] !== null)) return false;
      }
    }
  }

  const startX = direction === 'across' ? col - 1 : col;
  const startY = direction === 'across' ? row : row - 1;
  if (startX >= 0 && startY >= 0 && grid[startY][startX] !== null) return false;

  const endX = direction === 'across' ? col + word.length : col;
  const endY = direction === 'across' ? row : row + word.length;
  if (endX < GRID_SIZE && endY < GRID_SIZE && grid[endY][endX] !== null) return false;

  return true;
}

function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function addWordToGrid(word, grid) {
  for (let i = 0; i < word.answer.length; i++) {
    const x = word.direction === 'across' ? word.col + i : word.col;
    const y = word.direction === 'across' ? word.row : word.row + i;
    grid[y][x] = word.answer[i];
  }
  return grid;
}

function assignNumbers(placed, originalWords) {
  const wordMap = new Map(originalWords.map(w => [w.answer.toUpperCase(), w.question]));
  const successful = placed.filter(p => wordMap.has(p.answer));
  successful.sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col);
  successful.forEach((word, idx) => {
    word.number = idx + 1;
    word.clue = wordMap.get(word.answer);
  });
  return successful;
}

export { buildLayout, GRID_SIZE };
