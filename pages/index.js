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
    setLevelDone(true);

    if (revealUsed) {
      showOverlay('⚠️', "Fase revelada! Você não pontuou. Clique em 'Próximo Nível' para continuar.", 'warning');
      await gs.unlockNextLevel();
      setShowNextLvl(true);
      return;
    }

    showOverlay('⚖️', randomFrom(SUCCESS_MESSAGES), 'success');
    if (hintCount <= MAX_HINTS) await gs.addScore(100);
    await gs.addUsedWords(placedWords.map(w => w.answer));
    await gs.unlockNextLevel();
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
      showFeedback(`✅ ${data.message}`, 'success', 8000);
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
        <MobileLayout {...sharedProps} />
      ) : (
        <DesktopLayout {...sharedProps} />
      )}

      {/* Shared Overlays & Modals */}
      <LoginModal    visible={loginOpen}    onClose={() => setLoginOpen(false)} />
      <RegisterModal visible={registerOpen} onClose={() => setRegisterOpen(false)} />
      <RankingModal  visible={rankingOpen}  onClose={() => setRankingOpen(false)} />
      <ContactModal  visible={contactOpen}  onClose={() => setContactOpen(false)} />
      <AvatarSelector visible={avatarOpen}  onClose={() => setAvatarOpen(false)} />
      
      {showTutorial && <OnboardingTutorial onComplete={() => setShowTutorial(false)} />}

      <FeedbackOverlay {...overlay} onClose={() => setOverlay(o => ({ ...o, visible: false }))} />
      <RankingToast {...toast} onDismiss={() => setToast(t => ({ ...t, visible: false }))} />
    </>
  );
}
