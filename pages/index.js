import { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import { useGameState } from '@/hooks/useGameState';
import { buildLayout } from '@/lib/crosswordEngine';
import { SUBJECTS, SUCCESS_MESSAGES, randomFrom, rankingUpMsg, ADMIN_EMAIL, ADMIN_PHONE } from '@/lib/juriMessages';

import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import FeedbackOverlay from '@/components/notifications/FeedbackOverlay';
import RankingToast from '@/components/notifications/RankingToast';
import RankingModal from '@/components/game/RankingModal';
import ContactModal from '@/components/layout/ContactModal';
import AvatarSelector from '@/components/avatar/AvatarSelector';
import OnboardingTutorial from '@/components/game/OnboardingTutorial';
import UsernameModal from '@/components/auth/UsernameModal';

import { useDevice } from '@/hooks/useDevice';
import DesktopLayout from '@/components/ui/desktop/DesktopLayout';
import MobileLayout from '@/components/ui/mobile/MobileLayout';

const MAX_HINTS   = 3;

export default function Home() {
  const { user, gameState, loading: authLoading } = useAuth();
  const { isMobile, isLoaded } = useDevice();

  // ---- State Declarations (Top Level) ----
  const [loginOpen,    setLoginOpen]    = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [rankingOpen,  setRankingOpen]  = useState(false);
  const [contactOpen,  setContactOpen]  = useState(false);
  const [avatarOpen,   setAvatarOpen]   = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const [subject,      setSubject]      = useState(SUBJECTS[0]);
  const [placedWords,  setPlacedWords]  = useState([]);
  const [gameVisible,  setGameVisible]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [feedback,     setFeedback]     = useState({ msg: '', type: '' });
  const [hintCount,    setHintCount]    = useState(0);
  const [revealUsed,   setRevealUsed]   = useState(false);
  const [levelDone,    setLevelDone]    = useState(false);
  const [showNextLvl,  setShowNextLvl]  = useState(false);
  const [overlay,      setOverlay]      = useState({ visible: false, icon: '', message: '', type: 'neutral' });
  const [toast,        setToast]        = useState({ visible: false, icon: '', message: '', type: 'neutral' });
  const [failCounts,   setFailCounts]   = useState({});
  const [timeLeft,     setTimeLeft]     = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const gs = useGameState(subject);

  const isAdmin = user && (
    (user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ||
    user.phoneNumber === ADMIN_PHONE
  );

  // ---- Shared Handlers ----
  const showFeedback = useCallback((msg, type, duration = 4000) => {
    setFeedback({ msg, type });
    if (duration > 0) setTimeout(() => setFeedback({ msg: '', type: '' }), duration);
  }, []);

  const showOverlay = useCallback((icon, message, type) => {
    setOverlay({ visible: true, icon, message, type });
  }, []);

  const showToast = useCallback((icon, message, type, duration = 6000) => {
    setToast({ visible: true, icon, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), duration);
  }, []);

  const handleHint = useCallback(() => {
    if (hintCount >= MAX_HINTS) {
      showFeedback('Você já usou todos os corações! Não é possível mais pedir dicas nesta fase.', 'error', 4000);
      return;
    }
    if (!window._crosswordRevealHint) return;
    const revealed = window._crosswordRevealHint();
    if (revealed) {
      const next = hintCount + 1;
      setHintCount(next);
      showFeedback(`Você usou um coração! Restam ${MAX_HINTS - next}.`, 'info', 3000);
    } else {
      showFeedback('Selecione uma palavra ou célula primeiro.', 'error', 3000);
    }
  }, [hintCount, showFeedback]);

  // ---- Timer Logic ----
  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      handleTimerEnd();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleTimerEnd = () => {
    setIsTimerRunning(false);
    setGameVisible(false);
    const { FAILURE_MESSAGES } = require('@/lib/juriMessages');
    showOverlay('❌', randomFrom(FAILURE_MESSAGES), 'error');
  };

  const getLevelDuration = (lvl) => {
    if (lvl <= 10) return 180; // 3 min
    if (lvl <= 20) return 120; // 2 min
    return 90; // 1:30 min
  };

  // ---- Effects ----
  useEffect(() => {
    if (user && !authLoading && gameState) {
      if (!gameState.avatarId) {
        setAvatarOpen(true);
      } else {
        const tutorialDone = localStorage.getItem('juriquest_tutorial_done');
        if (tutorialDone !== 'true' && !showTutorial) {
          setShowTutorial(true);
        }
      }
    }
  }, [user, authLoading, !!gameState?.avatarId]);

  const handleGenerate = async () => {
    if (!user) return;
    setHintCount(0);
    setRevealUsed(false);
    setLevelDone(false);
    setShowNextLvl(false);
    setGameVisible(false);
    setIsTimerRunning(false);
    setFeedback({ msg: '', type: '' });
    await gs.setLevelCompleted(false);

    setIsLoading(true);
    try {
      const res = await fetch('/api/get-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, level: gs.level, previous_words: gs.usedWords }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const placed = buildLayout(data.crossword);
      if (!placed.length) throw new Error('Não foi possível montar a grade. Tente novamente.');

      setPlacedWords(placed);
      setGameVisible(true);

      // Inicia cronômetro após gerar nível com sucesso
      const duration = getLevelDuration(gs.level);
      setTimeLeft(duration);
      setIsTimerRunning(true);
    } catch (err) {
      const msg = err.message?.includes('Nenhuma pergunta')
        ? '🚧 Fase em construção! Em breve adicionaremos novas perguntas aqui.'
        : err.message;
      showFeedback(msg, 'error', 6000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSolved = useCallback(async () => {
    if (levelDone) return;
    setIsTimerRunning(false);
    setLevelDone(true);

    if (revealUsed) {
      showOverlay('⚠️', "Fase revelada! Você não pontuou. Clique em 'Próximo Nível' para continuar.", 'warning');
      await gs.unlockNextLevel();
      setShowNextLvl(true);
      return;
    }

    showOverlay('⚖️', randomFrom(SUCCESS_MESSAGES), 'success');
    
    // Calcula pontos (só ganha se usar dicas dentro do limite)
    const points = (hintCount <= MAX_HINTS) ? 100 : 0;
    const words = placedWords.map(w => w.answer);
    
    // Atualiza tudo em uma única transação atômica
    await gs.completeLevel(points, words);
    
    setShowNextLvl(true);

    try {
      const res = await fetch('/api/get-ranking');
      if (res.ok) {
        const { ranking } = await res.json();
        const nickname = gameState?.nickname || user?.email?.split('@')[0] || '';
        const myEntry  = ranking.find(p => p.name?.toLowerCase() === nickname.toLowerCase());
        if (myEntry && (ranking.indexOf(myEntry) + 1) <= 3) {
          showToast('📈', rankingUpMsg(nickname), 'success');
        }
      }
    } catch (_) {}
  }, [levelDone, revealUsed, hintCount, placedWords, gs, gameState, user, showOverlay, showToast]);

  const handleRevealAll = async () => {
    if (!confirm('Revelar tudo? Não pontuará.')) return;
    setRevealUsed(true);
    await window._crosswordRevealAll?.();
  };

  const handleClear = () => { window._crosswordClearAll?.(); };

  const handleNextLevel = () => {
    setShowNextLvl(false);
    setGameVisible(false);
    handleGenerate();
  };

  const handleReset = async () => {
    const label = SUBJECTS.find(s => s === subject) || subject;
    if (!confirm(`Resetar progresso de "${label}"?`)) return;
    await gs.resetProgress();
    setGameVisible(false);
    showFeedback('Progresso resetado!', 'info', 3000);
  };

  const handleAdminSeed = async () => {
    const secret = prompt('Admin Secret:');
    if (!secret) return;
    const lvl = prompt('Nível:', gs.level);
    showFeedback('⏳ IA gerando...', 'info', 0);
    try {
      const res  = await fetch('/api/seed-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, subject, level: parseInt(lvl, 10) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro desconhecido');
      const successMsg = data.message || data.msg || 'Questões geradas e salvas com sucesso!';
      showFeedback(`✅ ${successMsg}`, 'success', 8000);
    } catch (err) {
      showFeedback(`❌ ${err.message}`, 'error', 8000);
    }
  };

  const renderHearts = () => {
    return Array.from({ length: MAX_HINTS }, (_, i) => i < hintCount ? '🤍' : '❤️').join('');
  };

  if (authLoading || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="loading"><div className="loading__spinner" /><span>Carregando JuriQuest…</span></div>
      </div>
    );
  }

  const sharedProps = {
    user, gameState, subject, setSubject, gs, isLoading, gameVisible, showNextLvl,
    handleGenerate, handleNextLevel, handleReset, isAdmin, handleAdminSeed,
    hintCount, MAX_HINTS, renderHearts, placedWords,
    handleSolved, handleHint, handleClear, handleRevealAll,
    feedback,
    modals: {
      setLoginOpen: () => setLoginOpen(true),
      setRegisterOpen: () => setRegisterOpen(true),
      setRankingOpen: () => setRankingOpen(true),
      setContactOpen: () => setContactOpen(true),
      setAvatarOpen: () => setAvatarOpen(true),
      setTutorialOpen: () => setShowTutorial(true),
      SUBJECTS
    }
  };

  return (
    <>
      <Head><title>JuriQuest — O Desafio Jurídico</title></Head>

      {isMobile ? (
        <MobileLayout {...sharedProps} timeLeft={timeLeft} isTimerRunning={isTimerRunning} />
      ) : (
        <DesktopLayout {...sharedProps} timeLeft={timeLeft} isTimerRunning={isTimerRunning} />
      )}

      {/* Shared Overlays & Modals */}
      <LoginModal    visible={loginOpen}    onClose={() => setLoginOpen(false)} />
      <RegisterModal visible={registerOpen} onClose={() => setRegisterOpen(false)} />
      <UsernameModal isOpen={!!user && !authLoading && gameState && !gameState.nickname} />
      <RankingModal  visible={rankingOpen}  onClose={() => setRankingOpen(false)} />
      <ContactModal  visible={contactOpen}  onClose={() => setContactOpen(false)} />
      <AvatarSelector visible={avatarOpen}  onClose={() => setAvatarOpen(false)} />
      
      {showTutorial && <OnboardingTutorial onComplete={() => setShowTutorial(false)} />}

      <FeedbackOverlay {...overlay} onClose={() => setOverlay(o => ({ ...o, visible: false }))} />
      <RankingToast {...toast} onDismiss={() => setToast(t => ({ ...t, visible: false }))} />
    </>
  );
}
