// hooks/useGameState.js
import { useAuth } from '@/context/AuthContext';

export function useGameState(subject) {
  const { gameState, updateGameState } = useAuth();

  function _getSubject(gs) {
    if (!gs.subjects) gs.subjects = {};
    if (!gs.subjects[subject]) {
      gs.subjects[subject] = { level: 1, usedWords: [], score: 0, isLevelCompleted: false };
    }
    return gs.subjects[subject];
  }

  const subjectData = gameState ? _getSubject({ ...gameState }) : null;
  const level       = subjectData?.level ?? 1;
  const score       = subjectData?.score ?? 0;
  const usedWords   = subjectData?.usedWords ?? [];
  const isCompleted = subjectData?.isLevelCompleted ?? false;

  async function addScore(points) {
    await updateGameState(gs => { _getSubject(gs).score += points; });
  }

  async function addUsedWords(newWords) {
    await updateGameState(gs => {
      const sub = _getSubject(gs);
      sub.usedWords = [...new Set([...sub.usedWords, ...newWords.map(w => w.toUpperCase())])];
    });
  }

  async function unlockNextLevel() {
    await updateGameState(gs => { _getSubject(gs).level += 1; });
  }

  async function setLevelCompleted(val) {
    await updateGameState(gs => { _getSubject(gs).isLevelCompleted = val; });
  }

  async function resetProgress() {
    await updateGameState(gs => {
      gs.subjects[subject] = { level: 1, usedWords: [], score: 0, isLevelCompleted: false };
    });
  }

  return { level, score, usedWords, isCompleted, addScore, addUsedWords, unlockNextLevel, setLevelCompleted, resetProgress };
}
