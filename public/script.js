'use strict';

/* =============================================
   CONSTANTS
   ============================================= */
const GRID_SIZE = 20;
const MAX_ATTEMPTS = 150;

// Centraliza nomes de classes CSS para evitar "magic strings" e facilitar a manutenção.
const UI_CLASSES = {
  HIDDEN: 'hidden',
  SELECTED_CLUE: 'clues__item--selected',
  SOLVED_CLUE: 'clues__item--solved',
  CORRECT_INPUT: 'grid__cell__input--correct',
  WRONG_INPUT: 'grid__cell__input--wrong',
  REVEALED_INPUT: 'grid__cell__input--revealed',
  HINT_INPUT: 'grid__cell__input--hint',
  HIGHLIGHT_INPUT: 'grid__cell__input--highlight',
  BLOCKED_CELL: 'grid__cell--blocked',
};

/* =============================================
   GAME STATE MODULE
   ============================================= */
const GameState = {
  _db: null,
  _user: null,
  _state: {}, // Cache local do estado do usuário

  async loadForUser(user) {
    this._user = user;
    this._db = firebase.firestore();
    const userDocRef = this._db.collection('users').doc(user.uid);
    const doc = await userDocRef.get();

    if (doc.exists) {
      this._state = doc.data();
    } else {
      // Cria um documento inicial para um novo usuário
      this._state = { email: user.email, subjects: {} };
      await userDocRef.set(this._state);
    }
  },

  unload() {
    this._user = null;
    this._state = {};
  },

  async save() {
    if (!this._user) return;
    const userDocRef = this._db.collection('users').doc(this._user.uid);
    await userDocRef.set(this._state);
  },

  _getSubjectState(subject) {
    if (!this._state.subjects) {
      this._state.subjects = {};
    }
    if (!this._state.subjects[subject]) {
      this._state.subjects[subject] = { level: 1, usedWords: [], score: 0, isLevelCompleted: false };
    }
    return this._state.subjects[subject];
  },

  getCurrentLevel(subject) {
    return this._getSubjectState(subject).level;
  },

  getUsedWords(subject) { // Não precisa de 'async' pois lê do cache
    return this._getSubjectState(subject).usedWords || [];
  },

  addUsedWords(subject, newWords) {
    const subjectState = this._getSubjectState(subject);
    const updatedWords = [...new Set([...subjectState.usedWords, ...newWords.map(w => w.toUpperCase())])];
    subjectState.usedWords = updatedWords;
  },

  unlockNextLevel(subject) {
    const subjectState = this._getSubjectState(subject);
    subjectState.level += 1;
  },

  getCurrentScore(subject) {
    return this._getSubjectState(subject).score;
  },

  addScore(subject, points) {
    const subjectState = this._getSubjectState(subject);
    subjectState.score += points;
  },

  async resetProgress(subject) {
    if (this._state.subjects) {
      this._state.subjects[subject] = { level: 1, usedWords: [], score: 0, isLevelCompleted: false };
    }
    await this.save();
  },

  isLevelCompleted(subject) {
    return this._getSubjectState(subject).isLevelCompleted;
  },

  setLevelCompleted(subject, isCompleted) {
    this._getSubjectState(subject).isLevelCompleted = isCompleted;
  },
};

/* =============================================
   API MODULE
   ============================================= */
const API = {
  async generateCrossword(subject, level, previousWords = []) {
    // Usar URL relativa para funcionar tanto localmente quanto na Vercel
    const response = await fetch('/api/get-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, level, previous_words: previousWords }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao buscar perguntas da cruzadinha.');
    }

    return response.json();
  },

  async getRanking() {
    const response = await fetch('/api/get-ranking'); // GET request
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao carregar o ranking.');
    }
    return response.json();
  },
};

/* =============================================
   CROSSWORD GRID MODULE (pure logic, no DOM)
   ============================================= */
const CrosswordGrid = {
  /**
   * Constrói o layout da cruzadinha, priorizando interseções.
   * @param {Array<{question: string, answer: string}>} words - Lista de palavras e dicas.
   * @returns {Array<Object>} Lista de palavras posicionadas com metadados.
   */
  buildLayout(words) {
    // Ordena as palavras da maior para a menor para facilitar o encaixe inicial.
    const sortedWords = [...words].sort((a, b) => b.answer.length - a.answer.length);
    const placed = [];
    let grid = this._createEmptyGrid();

    // Tenta posicionar cada palavra.
    sortedWords.forEach((wordData, index) => {
      const answer = wordData.answer.toUpperCase();
      const clue = wordData.question;
      const position = this._findBestPosition(answer, placed, grid);

      if (position) {
        const newWord = {
          answer,
          clue,
          number: 0, // O número será reatribuído depois
          ...position
        };
        placed.push(newWord);
        grid = this._addWordToGrid(newWord, grid);
      } else {
        console.warn(`[CrosswordGrid] Could not place word: ${answer}`);
      }
    });

    // Reordena as palavras pela ordem original e atribui os números corretos.
    const finalLayout = this._assignNumbers(placed, words);
    return finalLayout;
  },

  /**
   * Encontra a melhor posição para uma palavra, priorizando interseções.
   * Se nenhuma interseção for encontrada, tenta uma posição aleatória.
   */
  _findBestPosition(word, placedWords, grid) {
    // 1. Se for a primeira palavra, posiciona no centro.
    if (placedWords.length === 0) {
      const direction = (word.length < GRID_SIZE / 2) ? 'across' : 'down';
      const col = Math.floor((GRID_SIZE - word.length) / 2);
      const row = Math.floor(GRID_SIZE / 2);
      const position = { col, row, direction };
      if (this._canPlace(word, position, grid)) {
        return position;
      }
    }

    // 2. Tenta encontrar uma posição de interseção.
    const intersectionPosition = this._findIntersection(word, placedWords, grid);
    if (intersectionPosition) {
      return intersectionPosition;
    }

    // 3. Se não houver interseção, tenta posicionar aleatoriamente (fallback).
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const direction = Math.random() > 0.5 ? 'across' : 'down';
        const col = Math.floor(Math.random() * (GRID_SIZE - (direction === 'across' ? word.length : 0)));
        const row = Math.floor(Math.random() * (GRID_SIZE - (direction === 'down' ? word.length : 0)));
        const position = { col, row, direction };
        if (this._canPlace(word, position, grid)) {
            return position;
        }
    }

    return null;
  },

  /**
   * Procura por uma letra em comum para criar uma interseção.
   */
  _findIntersection(word, placedWords, grid) {
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      for (const p_word of placedWords) {
        for (let j = 0; j < p_word.answer.length; j++) {
          if (p_word.answer[j] === letter) {
            // Letra em comum encontrada, tenta posicionar aqui.
            const direction = p_word.direction === 'across' ? 'down' : 'across';
            const row = (direction === 'down') ? p_word.row - i : p_word.row + j;
            const col = (direction === 'across') ? p_word.col - i : p_word.col + j;

            const position = { col, row, direction };

            if (this._canPlace(word, position, grid)) {
              return position;
            }
          }
        }
      }
    }
    return null;
  },

  /**
   * Verifica se uma palavra pode ser colocada em uma determinada posição na grade.
   * Esta verificação agora é mais rigorosa.
   */
  _canPlace(word, { col, row, direction }, grid) {
    // 1. Verifica se a palavra cabe na grade.
    if (col < 0 || row < 0 ||
        (direction === 'across' && col + word.length > GRID_SIZE) ||
        (direction === 'down' && row + word.length > GRID_SIZE)) {
      return false;
    }

    // 2. Verifica conflitos com outras palavras.
    for (let i = 0; i < word.length; i++) {
      const x = direction === 'across' ? col + i : col;
      const y = direction === 'across' ? row : row + i;

      // Verifica a célula da própria letra
      const gridLetter = grid[y][x];
      const wordLetter = word[i];
      if (gridLetter !== null && gridLetter !== wordLetter) {
        return false; // Conflito de letras na interseção
      }

      // Se a célula atual estiver vazia (não for uma interseção), verifica se as células
      // adjacentes (na direção perpendicular) também estão vazias. Isso evita que
      // palavras fiquem coladas lado a lado.
      if (gridLetter === null) {
        if (direction === 'across') {
          // Verifica acima e abaixo
          if ((y > 0 && grid[y - 1][x] !== null) || (y < GRID_SIZE - 1 && grid[y + 1][x] !== null)) {
            return false;
          }
        } else { // direction === 'down'
          // Verifica à esquerda e à direita
          if ((x > 0 && grid[y][x - 1] !== null) || (x < GRID_SIZE - 1 && grid[y][x + 1] !== null)) {
            return false;
          }
        }
      }
    }
    
    // 3. Verifica se a palavra não começa ou termina colada em outra letra
    const startX = direction === 'across' ? col - 1 : col;
    const startY = direction === 'across' ? row : row - 1;
    if(startX >= 0 && startY >= 0 && grid[startY][startX] !== null) return false;

    const endX = direction === 'across' ? col + word.length : col;
    const endY = direction === 'across' ? row : row + word.length;
    if(endX < GRID_SIZE && endY < GRID_SIZE && grid[endY][endX] !== null) return false;


    return true;
  },

  /**
   * Cria uma representação da grade vazia.
   */
  _createEmptyGrid() {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  },

  /**
   * Adiciona uma palavra à representação da grade.
   */
  _addWordToGrid(word, grid) {
    for (let i = 0; i < word.answer.length; i++) {
      const x = word.direction === 'across' ? word.col + i : word.col;
      const y = word.direction === 'across' ? word.row : word.row + i;
      grid[y][x] = word.answer[i];
    }
    return grid;
  },

  /**
    * Atribui números às palavras de forma sequencial (1, 2, 3...)
    * e as reordena para corresponder à lista de dicas original.
    */
   _assignNumbers(placed, originalWords) {
    const wordMap = new Map(originalWords.map(w => [w.answer.toUpperCase(), w.question]));
    
    // Filtra palavras que foram de fato posicionadas
    const successfullyPlaced = placed.filter(p => wordMap.has(p.answer));
    
    // Ordena por posição (de cima para baixo, da esquerda para a direita) para numeração lógica
    successfullyPlaced.sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
    });

    // Atribui números
    successfullyPlaced.forEach((word, index) => {
        word.number = index + 1;
        // Reatribui a pergunta original para garantir consistência
        word.clue = wordMap.get(word.answer);
    });

    return successfullyPlaced;
   }
};

/* =============================================
   CROSSWORD UI MODULE
   ============================================= */
const CrosswordUI = {
  gridEl: null,
  acrossListEl: null,
  downListEl: null,
  placedWords: [],
  activeWord: null,
  activeDirection: 'across',

  init() {
    this.gridEl       = document.getElementById('grid-container');
    this.acrossListEl = document.getElementById('across-clues-list');
    this.downListEl   = document.getElementById('down-clues-list');
  },

  render(placedWords) {
    this.placedWords = placedWords;
    this.activeWord = null;
    this.activeDirection = 'across';
    this._clearAll();
    this._setupGrid();
    this._renderWords(placedWords);
    this._renderClues(placedWords);
    this._attachGridListeners();
  },

  _checkInput(input) {
    if (input.readOnly) return false;
    const isCorrect = input.value.toUpperCase() === input.dataset.answer;
    input.classList.toggle(UI_CLASSES.CORRECT_INPUT, isCorrect && input.value !== '');
    input.classList.toggle(UI_CLASSES.WRONG_INPUT, !isCorrect && input.value !== '');
    return isCorrect;
  },

  async revealAll() {
    const inputs = this.gridEl.querySelectorAll('.grid__cell__input:not([readOnly])');
    for (const input of inputs) {
      input.value = input.dataset.answer;
      input.readOnly = true;
      input.classList.remove(UI_CLASSES.CORRECT_INPUT, UI_CLASSES.WRONG_INPUT);
      input.classList.add(UI_CLASSES.REVEALED_INPUT);
      await new Promise(resolve => setTimeout(resolve, 35));
    }
    this._updateClueStates();
  },

  revealHint() {
    const selectedClue = document.querySelector(`.${UI_CLASSES.SELECTED_CLUE}`);
    if (!selectedClue) {
      Feedback.show('Selecione uma dica primeiro.', 'error');
      return;
    }
    if (!this.activeWord) return;

    const { answer } = this.activeWord;

    for (let i = 0; i < answer.length; i++) {
      const { col, row } = this._getCoordsForIndex(this.activeWord, i);
      const input = this._cellAt(col, row)?.querySelector('input');
      if (input && !input.readOnly && input.value.toUpperCase() !== answer[i]) {
        input.value = answer[i];
        input.classList.add(UI_CLASSES.HINT_INPUT);
        this._checkInput(input);
        this._updateClueStates();
        return;
      }
    }
  },

  clearAll() {
    this.gridEl.querySelectorAll('.grid__cell__input').forEach(input => {
      if (input.readOnly) return;
      input.value = '';
      input.classList.remove(UI_CLASSES.CORRECT_INPUT, UI_CLASSES.WRONG_INPUT, UI_CLASSES.REVEALED_INPUT, UI_CLASSES.HINT_INPUT);
    });
    this._updateClueStates();
  },

  _clearAll() {
    this.gridEl.innerHTML = '';
    this.acrossListEl.innerHTML = '';
    this.downListEl.innerHTML = '';
  },

  _setupGrid() {
    this.gridEl.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 32px)`;
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const cell = document.createElement('div');
      cell.classList.add('grid__cell', UI_CLASSES.BLOCKED_CELL);
      this.gridEl.appendChild(cell);
    }
  },

  _cellAt(col, row) {
    return this.gridEl.children[row * GRID_SIZE + col];
  },

  _renderWords(placedWords) {
    placedWords.forEach(word => this._renderWord(word));
  },

  _renderWord({ answer, col, row, direction, number }) {
    for (let i = 0; i < answer.length; i++) {
      const x = direction === 'across' ? col + i : col;
      const y = direction === 'across' ? row     : row + i;
      const cell = this._cellAt(x, y);
      if (!cell) continue;

      cell.classList.remove(UI_CLASSES.BLOCKED_CELL);
      if (!cell.querySelector('input')) {
        cell.appendChild(this._createLetterInput(answer[i]));
      }
      if (i === 0 && !cell.querySelector('.grid__cell__number')) {
        const numEl = document.createElement('span');
        numEl.className = 'grid__cell__number';
        numEl.textContent = number;
        cell.prepend(numEl);
      }
    }
  },

  _createLetterInput(correctLetter) {
    const input = document.createElement('input');
    Object.assign(input, { type: 'text', maxLength: 1, autocomplete: 'off', spellcheck: false });
    input.className = 'grid__cell__input';
    input.dataset.answer = correctLetter;
    return input;
  },

  _renderClues(placedWords) {
    placedWords.forEach(({ number, clue, direction }) => {
      const item = document.createElement('li');
      item.className = 'clues__item';
      item.dataset.number = number;
      item.dataset.direction = direction;
      
      // Usar createElement em vez de innerHTML para mais segurança e performance.
      const b = document.createElement('b');
      b.textContent = `${number}. `;
      item.appendChild(b);
      item.append(clue); // append() pode adicionar nós de texto diretamente.

      item.addEventListener('click', () => {
        this._setActiveWord(number, direction);
        const word = this.placedWords.find(w => w.number == number && w.direction == direction);
        if (word) {
          const firstInput = this._cellAt(word.col, word.row)?.querySelector('input');
          firstInput?.focus();
        }
      });
      (direction === 'across' ? this.acrossListEl : this.downListEl).appendChild(item);
    });
  },

  _highlightWord() {
    document.querySelectorAll(`.${UI_CLASSES.HIGHLIGHT_INPUT}`).forEach(i => i.classList.remove(UI_CLASSES.HIGHLIGHT_INPUT));
    if (!this.activeWord) return;
    for (let i = 0; i < this.activeWord.answer.length; i++) {
      const { col, row } = this._getCoordsForIndex(this.activeWord, i);
      this._cellAt(col, row)?.querySelector('input')?.classList.add(UI_CLASSES.HIGHLIGHT_INPUT);
    }
  },

  _attachGridListeners() {
    this.gridEl.addEventListener('input', e => {
      const input = e.target.closest('.grid__cell__input');
      if (!input) return;
      if (this._checkInput(input)) {
        this._advanceFocus(input);
      }
      this._updateClueStates();
    });

    this.gridEl.addEventListener('keydown', e => {
      const input = e.target.closest('.grid__cell__input');
      if (!input) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        this._moveFocusWithArrows(input, e.key);
        return;
      }

      if (e.key === 'Backspace' && input.value === '' && this.activeWord) {
        this._moveFocus(input, -1);
      }
    });

    this.gridEl.addEventListener('focusin', e => {
      const input = e.target.closest('.grid__cell__input');
      if (!input) return;
      this._handleCellFocus(input);
    });

    this.gridEl.addEventListener('click', e => {
      const input = e.target.closest('.grid__cell__input');
      if (!input) return;
      this._handleCellFocus(input, true); // Force direction toggle on click
    });
  },

  _handleCellFocus(input, forceToggle = false) {
    const { col, row } = this._getCoordsFromInput(input);
    const wordsAtCell = this.placedWords.filter(w => this._isCoordInWord(w, col, row));
    
    if (wordsAtCell.length === 0) return;

    const acrossWord = wordsAtCell.find(w => w.direction === 'across');
    const downWord = wordsAtCell.find(w => w.direction === 'down');

    let newDirection = this.activeDirection;
    let newActiveWord = this.activeWord;

    if (forceToggle && this.activeWord && this._isCoordInWord(this.activeWord, col, row) && acrossWord && downWord) {
      // If clicking the same cell, toggle direction
      newDirection = this.activeDirection === 'across' ? 'down' : 'across';
    }

    if (newDirection === 'across' && acrossWord) {
      newActiveWord = acrossWord;
    } else if (newDirection === 'down' && downWord) {
      newActiveWord = downWord;
    } else {
      // Fallback to the first available word
      newActiveWord = acrossWord || downWord;
    }
    
    this.activeDirection = newActiveWord.direction;
    this._setActiveWord(newActiveWord.number, newActiveWord.direction);
  },

  _setActiveWord(number, direction) {
    this.activeWord = this.placedWords.find(w => w.number == number && w.direction == direction);
    this.activeDirection = direction;

    document.querySelectorAll(`.${UI_CLASSES.SELECTED_CLUE}`).forEach(i => i.classList.remove(UI_CLASSES.SELECTED_CLUE));
    const clueEl = document.querySelector(`.clues__item[data-number="${number}"][data-direction="${direction}"]`);
    clueEl?.classList.add(UI_CLASSES.SELECTED_CLUE);

    this._highlightWord();
  },

  _advanceFocus(input) {
    if (!this.activeWord) return;
    this._moveFocus(input, 1);
  },
  
  _moveFocus(input, delta) {
    if (!this.activeWord) return;
    const { col, row } = this._getCoordsFromInput(input);
    const currentIndex = this.activeDirection === 'across' ? col - this.activeWord.col : row - this.activeWord.row;
    const nextIndex = currentIndex + delta;

    if (nextIndex >= 0 && nextIndex < this.activeWord.answer.length) {
      const { col: nextCol, row: nextRow } = this._getCoordsForIndex(this.activeWord, nextIndex);
      this._cellAt(nextCol, nextRow)?.querySelector('input')?.focus();
    }
  },

  _moveFocusWithArrows(input, key) {
    const { col, row } = this._getCoordsFromInput(input);
    let nextCol = col, nextRow = row;

    if (key === 'ArrowUp') nextRow--;
    else if (key === 'ArrowDown') nextRow++;
    else if (key === 'ArrowLeft') nextCol--;
    else if (key === 'ArrowRight') nextCol++;

    if (nextRow >= 0 && nextRow < GRID_SIZE && nextCol >= 0 && nextCol < GRID_SIZE) {
      this._cellAt(nextCol, nextRow)?.querySelector('input')?.focus();
    }
  },

  _updateClueStates() {
    let allWordsSolved = this.placedWords.length > 0;
    this.placedWords.forEach(word => {
      const isSolved = this._isWordSolved(word);
      if (!isSolved) allWordsSolved = false;
      const item = document.querySelector(`.clues__item[data-number="${word.number}"][data-direction="${word.direction}"]`);
      item?.classList.toggle(UI_CLASSES.SOLVED_CLUE, isSolved);
    });

    if (allWordsSolved && this.placedWords.length > 0) {
      this.gridEl.dispatchEvent(new CustomEvent('crossword-solved', { bubbles: true }));
    }
  },

  _isWordSolved({ answer, col, row, direction }) {
    for (let i = 0; i < answer.length; i++) {
      const { col: cellCol, row: cellRow } = this._getCoordsForIndex({ col, row, direction }, i);
      const input = this._cellAt(cellCol, cellRow)?.querySelector('input');
      if (!input || input.value.toUpperCase() !== answer[i]) return false;
    }
    return true;
  },

  _getCoordsFromInput(input) {
    const parentCell = input.closest('.grid__cell');
    if (!parentCell) return { col: null, row: null };
    const index = [...this.gridEl.children].indexOf(parentCell);
    if (index === -1) return { col: null, row: null };
    return { col: index % GRID_SIZE, row: Math.floor(index / GRID_SIZE) };
  },

  _getCoordsForIndex(word, index) {
    const col = word.direction === 'across' ? word.col + index : word.col;
    const row = word.direction === 'across' ? word.row : word.row + index;
    return { col, row };
  },

  _isCoordInWord(word, col, row) {
    const isAcross = word.direction === 'across' && row === word.row && col >= word.col && col < word.col + word.answer.length;
    const isDown = word.direction === 'down' && col === word.col && row >= word.row && row < word.row + word.answer.length;
    return isAcross || isDown;
  },
};

/* =============================================
   FEEDBACK MODULE
   ============================================= */
const Feedback = {
  el: null, _timer: null,
  init() { this.el = document.getElementById('feedback'); },
  show(message, type = 'info', duration = 4000) {
    clearTimeout(this._timer);
    this.el.textContent = message;
    this.el.className = `feedback feedback--${type}`;
    this.el.classList.remove(UI_CLASSES.HIDDEN);
    if (duration > 0) this._timer = setTimeout(() => this.hide(), duration);
  },
  hide() { this.el.classList.add(UI_CLASSES.HIDDEN); },
};

/* =============================================
   APP – ENTRY POINT
   ============================================= */
const app = {
  elements: {},
  confirmationResult: null,

  init() {
    this.elements = {
      // Auth elements
      userStatus: document.getElementById('user-status'),
      userDisplay: document.getElementById('user-display'),
      loginModalBtn: document.getElementById('login-modal-btn'),
      registerModalBtn: document.getElementById('register-modal-btn'),
      logoutBtn: document.getElementById('logout-btn'),
      rankingModalBtn: document.getElementById('ranking-modal-btn'),
      rankingModal: document.getElementById('ranking-modal'),
      rankingList: document.getElementById('ranking-list'),
      rankingLoading: document.getElementById('ranking-loading'),
      rankingError: document.getElementById('ranking-error'),
      loginModal: document.getElementById('login-modal'),
      registerModal: document.getElementById('register-modal'),
      loginForm: document.getElementById('login-form'),
      registerForm: document.getElementById('register-form'),
      loginError: document.getElementById('login-error'),
      registerError: document.getElementById('register-error'),
      phoneLoginForm: document.getElementById('phone-login-form'),
      phoneNumberInput: document.getElementById('phone-number-input'),
      sendCodeBtn: document.getElementById('send-code-btn'),
      recaptchaContainer: document.getElementById('recaptcha-container'),
      phoneLoginError: document.getElementById('phone-login-error'),
      verifyCodeForm: document.getElementById('verify-code-form'),
      verificationCodeInput: document.getElementById('verification-code-input'),
      verifyCodeBtn: document.getElementById('verify-code-btn'),
      verifyCodeError: document.getElementById('verify-code-error'),
      authRequiredMessage: document.getElementById('auth-required-message'),
      gameContent: document.getElementById('game-content'),

      // Game elements
      generateBtn: document.getElementById('generate-btn'),
      nextLevelBtn: document.getElementById('next-level-btn'),
      subjectSelect: document.getElementById('subject'),
      levelDisplay: document.getElementById('level-display'),
      loading: document.getElementById('loading'),
      crosswordContainer: document.getElementById('crossword-container'),
      crosswordActions: document.querySelector('.crossword__actions'),
      revealBtn: document.getElementById('reveal-btn'),
      resetBtn: document.getElementById('reset-btn'),
      clearBtn: document.getElementById('clear-btn'),
      hintBtn: document.getElementById('hint-btn'),
      scoreDisplay: document.getElementById('score-display'),
    };

    // Cria um botão de painel Admin visível apenas para você
    const adminBtn = document.createElement('button');
    adminBtn.id = 'btn-admin';
    adminBtn.className = 'btn hidden';
    adminBtn.style.backgroundColor = '#dc2626'; // Vermelho para destacar
    adminBtn.style.marginTop = '15px';
    adminBtn.innerHTML = '<span class="btn__text">⚙️ Painel Admin: Gerar Fase na IA</span>';
    if (this.elements.generateBtn && this.elements.generateBtn.parentNode) {
      this.elements.generateBtn.parentNode.insertBefore(adminBtn, this.elements.generateBtn.nextSibling);
    }
    this.elements.adminBtn = adminBtn;

    // Aguarda o SDK do Firebase carregar
    const firebaseAppCheck = setInterval(() => {
      if (window.firebase && firebase.app) {
        clearInterval(firebaseAppCheck);
        this._initializeApp();
      }
    }, 100);
  },

  _initializeApp() {
    // Configura o reCAPTCHA para verificação por telefone.
    // Ele fica invisível até ser chamado.
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA resolvido, pode prosseguir com o envio do código.
      }
    });
    CrosswordUI.init();
    Feedback.init();
    this._bindEvents();
    this._updateLevelDisplay();
  },

  _bindEvents() {
    const { generateBtn, nextLevelBtn, subjectSelect, revealBtn, clearBtn, hintBtn, resetBtn, loginModalBtn, registerModalBtn, logoutBtn, loginForm, registerForm, phoneLoginForm, verifyCodeForm, rankingModalBtn } = this.elements;

    // Game events
    generateBtn.addEventListener('click', () => this._onGenerate());
    nextLevelBtn.addEventListener('click', () => this._onNextLevel());
    subjectSelect.addEventListener('change', () => this._updateLevelDisplay());
    revealBtn.addEventListener('click', () => CrosswordUI.revealAll());
    clearBtn.addEventListener('click', () => CrosswordUI.clearAll());
    resetBtn.addEventListener('click', () => this._onReset());
    hintBtn.addEventListener('click', () => CrosswordUI.revealHint());
    CrosswordUI.gridEl.addEventListener('crossword-solved', () => this.onLevelComplete());

    // Evento do botão Admin visível
    this.elements.adminBtn.addEventListener('click', () => this._triggerAdminSeed());

    // Auth events
    loginModalBtn.addEventListener('click', () => this._showModal('login-modal'));
    registerModalBtn.addEventListener('click', () => this._showModal('register-modal'));
    rankingModalBtn.addEventListener('click', () => this._showRanking());
    logoutBtn.addEventListener('click', () => firebase.auth().signOut());

    loginForm.addEventListener('submit', e => this._handleLogin(e));
    registerForm.addEventListener('submit', e => this._handleRegister(e));
    phoneLoginForm.addEventListener('submit', e => this._handlePhoneAuth(e));
    verifyCodeForm.addEventListener('submit', e => this._handleVerifyCode(e));

    // Auth tab switching
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this._handleTabSwitch(e));
    });


    // Modal close buttons
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
      btn.addEventListener('click', () => this._hideModal(btn.dataset.modalId));
    });
    window.addEventListener('click', e => {
      if (e.target.classList.contains('modal')) {
        this._hideModal(e.target.id);
      }
    });

    // Firebase Auth state listener
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this._handleUserLoggedIn(user);
      } else {
        this._handleUserLoggedOut();
      }
    });

    // Admin Hidden Trigger (Digite 'admin' fora de qualquer input)
    let keySequence = '';
    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      
      if (e.key && e.key.length === 1) {
        keySequence += e.key.toLowerCase();
        if (keySequence.length > 10) keySequence = keySequence.slice(-10);
        
        if (keySequence.endsWith('admin')) {
          keySequence = '';
          this._triggerAdminSeed();
        }
      }
    });
  },

  async _handleUserLoggedIn(user) {
    await GameState.loadForUser(user);
    // Mostra um nome mais amigável (parte do email antes do @ ou o número de telefone)
    const displayName = user.email 
      ? user.email.split('@')[0] 
      : user.phoneNumber;

    this.elements.userDisplay.textContent = `Olá, ${displayName}`;
    this.elements.userDisplay.classList.remove(UI_CLASSES.HIDDEN);
    this.elements.loginModalBtn.classList.add(UI_CLASSES.HIDDEN);
    this.elements.registerModalBtn.classList.add(UI_CLASSES.HIDDEN);
    this.elements.logoutBtn.classList.remove(UI_CLASSES.HIDDEN);
    this.elements.authRequiredMessage.classList.add(UI_CLASSES.HIDDEN);
    this.elements.gameContent.classList.remove(UI_CLASSES.HIDDEN);

    // --- CONTROLE DE ACESSO ADMIN ---
    const MEU_EMAIL_ADMIN = 'pedrohenriqueinsec281@gmail.com'; 
    
    // Se você costuma testar usando o login por celular, coloque seu número aqui:
    const MEU_CELULAR_ADMIN = '+5584991101624'; 

    // Log no console para ajudar a identificar como o sistema está lendo sua conta
    console.log("DEBUG ADMIN -> Email:", user.email, "| Telefone:", user.phoneNumber);

    // Checa se o e-mail bate (ignorando letras maiúsculas) ou se o telefone bate
    const isAdminEmail = user.email && user.email.toLowerCase() === MEU_EMAIL_ADMIN.toLowerCase();
    const isAdminPhone = user.phoneNumber && user.phoneNumber === MEU_CELULAR_ADMIN;

    if (isAdminEmail || isAdminPhone) {
      this.elements.adminBtn.classList.remove(UI_CLASSES.HIDDEN);
      this.elements.adminBtn.style.display = 'block'; // Força a exibição caso o CSS bloqueie
      console.log("DEBUG ADMIN -> Acesso de Administrador Concedido! O botão vermelho deve aparecer.");
    } else {
      this.elements.adminBtn.classList.add(UI_CLASSES.HIDDEN);
      this.elements.adminBtn.style.display = 'none';
    }

    this._updateLevelDisplay();
  },

  _handleUserLoggedOut() {
    GameState.unload();
    this.elements.userDisplay.classList.add(UI_CLASSES.HIDDEN);
    this.elements.loginModalBtn.classList.remove(UI_CLASSES.HIDDEN);
    this.elements.registerModalBtn.classList.remove(UI_CLASSES.HIDDEN);
    this.elements.logoutBtn.classList.add(UI_CLASSES.HIDDEN);
    this.elements.authRequiredMessage.classList.remove(UI_CLASSES.HIDDEN);
    this.elements.gameContent.classList.add(UI_CLASSES.HIDDEN);
  },

  async _handleLogin(e) {
    e.preventDefault();
    const email = this.elements.loginForm.querySelector('#login-email').value;
    const password = this.elements.loginForm.querySelector('#login-password').value;
    this.elements.loginError.textContent = '';
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      this._hideModal('login-modal');
      this.elements.loginForm.reset();
    } catch (error) {
      this.elements.loginError.textContent = 'E-mail ou senha inválidos.';
      console.error("Erro de login:", error);
    }
  },

  async _handleRegister(e) {
    e.preventDefault();
    const email = this.elements.registerForm.querySelector('#register-email').value;
    const password = this.elements.registerForm.querySelector('#register-password').value;
    this.elements.registerError.textContent = '';
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      this._hideModal('register-modal');
      this.elements.registerForm.reset();
    } catch (error) {
      if (error.code === 'auth/weak-password') {
        this.elements.registerError.textContent = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.code === 'auth/email-already-in-use') {
        this.elements.registerError.textContent = 'Este e-mail já está em uso.';
      } else {
        this.elements.registerError.textContent = 'Ocorreu um erro ao cadastrar.';
      }
      console.error("Erro de cadastro:", error);
    }
  },

  _handleTabSwitch(e) {
    const button = e.currentTarget;
    const modalId = button.dataset.modal;
    const tabId = button.dataset.tab;

    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Desativa todos os botões e abas dentro do modal
    modal.querySelectorAll('.modal-tab-btn').forEach(btn => btn.classList.remove('active'));
    modal.querySelectorAll('.modal-tab-content').forEach(tab => tab.classList.remove('active'));

    // Ativa o botão e a aba clicados
    button.classList.add('active');
    document.getElementById(tabId)?.classList.add('active');
  },

  async _handlePhoneAuth(e) {
    e.preventDefault();
    this.elements.phoneLoginError.textContent = '';
    this.elements.sendCodeBtn.disabled = true;
    this.elements.sendCodeBtn.textContent = 'Enviando...';

    const phoneNumber = this.elements.phoneNumberInput.value;
    const appVerifier = window.recaptchaVerifier;

    try {
      this.confirmationResult = await firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier);
      // Mostra o formulário de verificação de código
      this.elements.phoneLoginForm.classList.add(UI_CLASSES.HIDDEN);
      this.elements.verifyCodeForm.classList.remove(UI_CLASSES.HIDDEN);
    } catch (error) {
      console.error("Erro ao enviar código do celular:", error);
      if (error.code === 'auth/invalid-phone-number') {
        this.elements.phoneLoginError.textContent = 'Número de celular inválido. Inclua o código do país (ex: +55).';
      } else {
        this.elements.phoneLoginError.textContent = 'Falha ao enviar o código. Tente novamente.';
      }
      // Renderiza o reCAPTCHA novamente se falhar
      window.recaptchaVerifier.render().catch(err => console.error("Falha ao renderizar reCAPTCHA", err));
    } finally {
      this.elements.sendCodeBtn.disabled = false;
      this.elements.sendCodeBtn.textContent = 'Enviar Código';
    }
  },

  async _handleVerifyCode(e) {
    e.preventDefault();
    this.elements.verifyCodeError.textContent = '';
    this.elements.verifyCodeBtn.disabled = true;
    this.elements.verifyCodeBtn.textContent = 'Verificando...';

    const code = this.elements.verificationCodeInput.value;

    try {
      await this.confirmationResult.confirm(code);
      // O onAuthStateChanged vai lidar com o login bem-sucedido.
      this._hideModal('login-modal');
    } catch (error) {
      console.error("Erro ao verificar código:", error);
      this.elements.verifyCodeError.textContent = 'Código inválido. Tente novamente.';
    } finally {
      this.elements.verifyCodeBtn.disabled = false;
      this.elements.verifyCodeBtn.textContent = 'Verificar e Entrar';
    }
  },

  _showModal(modalId) {
    document.getElementById(modalId).classList.remove(UI_CLASSES.HIDDEN);
  },

  _hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add(UI_CLASSES.HIDDEN);
      modal.querySelector('.error-message').textContent = '';

      // Reseta os formulários de celular ao fechar o modal
      if (modalId === 'login-modal') {
        this.elements.phoneLoginForm.classList.remove(UI_CLASSES.HIDDEN);
        this.elements.verifyCodeForm.classList.add(UI_CLASSES.HIDDEN);
        this.elements.phoneLoginForm.reset();
        this.elements.verifyCodeForm.reset();
        this.elements.phoneLoginError.textContent = '';
        this.elements.verifyCodeError.textContent = '';
      }
    }
  },

  async _showRanking() {
    this._showModal('ranking-modal');
    this.elements.rankingLoading.classList.remove(UI_CLASSES.HIDDEN);
    this.elements.rankingList.classList.add(UI_CLASSES.HIDDEN);
    this.elements.rankingError.textContent = '';

    try {
      const data = await API.getRanking();
      this._renderRanking(data.ranking);
    } catch (error) {
      this.elements.rankingError.textContent = error.message;
    } finally {
      this.elements.rankingLoading.classList.add(UI_CLASSES.HIDDEN);
    }
  },

  _renderRanking(players) {
    this.elements.rankingList.innerHTML = '';
    if (players.length === 0) {
      this.elements.rankingError.textContent = 'O ranking ainda está vazio. Jogue para aparecer aqui!';
      return;
    }

    const medals = ['🥇', '🥈', '🥉'];

    players.forEach((player, index) => {
      const rank = index + 1;
      const li = document.createElement('li');
      li.className = 'ranking-item';
      if (rank <= 3) {
        li.classList.add(`ranking-item--${rank}`);
      }

      const medal = medals[index] || `${rank}.`;

      li.innerHTML = `
        <div class="ranking-item__info">
          <span class="ranking-item__rank">${medal}</span>
          <span class="ranking-item__name">${player.name}</span>
        </div>
        <div class="ranking-item__stats">
          <span>${player.totalScore}</span> pts / Nível <span>${player.highestLevel}</span>
        </div>
      `;
      this.elements.rankingList.appendChild(li);
    });

    this.elements.rankingList.classList.remove(UI_CLASSES.HIDDEN);
  },

  async _onGenerate() {
    const subject = this.elements.subjectSelect.value;
    GameState.setLevelCompleted(subject, false); // Reseta o estado de "completo" para a nova fase
    await GameState.save();
    const level = GameState.getCurrentLevel(subject);
    const previousWords = GameState.getUsedWords(subject);
    this._setLoading(true);
    Feedback.hide();
    this.elements.generateBtn.classList.add(UI_CLASSES.HIDDEN);

    try {
      const data = await API.generateCrossword(subject, level, previousWords);
      const placedWords = CrosswordGrid.buildLayout(data.crossword);
      
      if (placedWords.length === 0) {
          throw new Error("Não foi possível montar a grade. Tente gerar novamente.");
      }

      CrosswordUI.render(placedWords);
      this.elements.crosswordContainer.classList.remove(UI_CLASSES.HIDDEN);
      this.elements.crosswordActions.classList.remove(UI_CLASSES.HIDDEN);
    } catch (error) {
      // Se for o erro do banco de dados vazio, mostra mensagem amigável para usuários normais
      if (error.message && error.message.includes('Nenhuma pergunta encontrada')) {
        Feedback.show('🚧 Fase em construção! Em breve adicionaremos novas perguntas aqui.', 'info', 5000);
      } else {
        Feedback.show(error.message, 'error');
      }
      this.elements.generateBtn.classList.remove(UI_CLASSES.HIDDEN);
    } finally {
      this._setLoading(false);
    }
  },

  async onLevelComplete() {
    const subject = this.elements.subjectSelect.value;
    if (GameState.isLevelCompleted(subject)) return; // Previne que a função seja executada múltiplas vezes

    GameState.setLevelCompleted(subject, true);
    Feedback.show('🎉 Parabéns! Você completou a fase!', 'success', 5000);

    // Adiciona as palavras resolvidas ao estado do jogo para não serem repetidas
    const solvedWords = CrosswordUI.placedWords.map(word => word.answer);
    GameState.addUsedWords(subject, solvedWords);

    // Adiciona 100 pontos e atualiza o placar
    GameState.addScore(subject, 100);
    this._updateScoreDisplay();

    GameState.unlockNextLevel(subject);

    await GameState.save(); // Salva todas as alterações de uma só vez!
    this.elements.nextLevelBtn.classList.remove(UI_CLASSES.HIDDEN);
    this.elements.crosswordActions.classList.add(UI_CLASSES.HIDDEN);
  },

  _onNextLevel() {
    this.elements.crosswordActions.classList.add(UI_CLASSES.HIDDEN);
    this._updateLevelDisplay();
    this.elements.nextLevelBtn.classList.add(UI_CLASSES.HIDDEN);
    this._onGenerate();
  },

  async _onReset() {
    const subject = this.elements.subjectSelect.value;
    const subjectText = this.elements.subjectSelect.options[this.elements.subjectSelect.selectedIndex].text;
    if (confirm(`Você tem certeza que deseja resetar todo o progresso de "${subjectText}"? Você voltará para o nível 1 e sua pontuação será zerada.`)) {
      await GameState.resetProgress(subject);
      this._updateLevelDisplay();
      Feedback.show('Progresso resetado com sucesso!', 'info');
    }
  },

  _updateScoreDisplay() {
    const subject = this.elements.subjectSelect.value;
    const score = GameState.getCurrentScore(subject);
    this.elements.scoreDisplay.textContent = score;
  },

  _updateLevelDisplay() {
    const subject = this.elements.subjectSelect.value;
    const level = GameState.getCurrentLevel(subject);
    this.elements.levelDisplay.textContent = level;
    this._updateScoreDisplay();

    const btnText = this.elements.generateBtn.querySelector('.btn__text');
    if (btnText) btnText.textContent = `Iniciar Nível ${level}`;
    
    this.elements.generateBtn.classList.remove(UI_CLASSES.HIDDEN);
    this.elements.crosswordContainer.classList.add(UI_CLASSES.HIDDEN);
    this.elements.crosswordActions.classList.add(UI_CLASSES.HIDDEN);
    Feedback.hide();
  },

  async _triggerAdminSeed() {
    const secret = prompt("Painel Admin: Digite a senha secreta (SEED_SECRET) para popular o banco de dados:");
    if (!secret) return;

    const subject = this.elements.subjectSelect.value;
    const currentLevel = this.elements.levelDisplay.textContent || 1;
    
    const levelInput = prompt(`Gerar perguntas para a matéria:\n"${subject}"\n\nQual nível você deseja gerar?`, currentLevel);
    if (!levelInput) return;
    
    const level = parseInt(levelInput, 10);
    if (isNaN(level) || level < 1) {
        Feedback.show("Nível inválido.", "error");
        return;
    }

    // Mostra feedback persistente (duration = 0)
    Feedback.show(`⏳ IA gerando perguntas para ${subject} (Nível ${level}). Isso pode levar alguns segundos...`, 'info', 0);

    try {
      const response = await fetch('/api/seed-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, subject, level })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro desconhecido ao popular o banco.');
      }

      Feedback.show(`✅ Sucesso: ${data.message}`, 'success', 8000);
    } catch (error) {
      Feedback.show(`❌ Erro Admin: ${error.message}`, 'error', 8000);
    }
  },

  _setLoading(isLoading) {
    this.elements.loading.classList.toggle(UI_CLASSES.HIDDEN, !isLoading);
    this.elements.generateBtn.disabled = isLoading;
    this.elements.nextLevelBtn.disabled = isLoading;
  },
};

app.init();