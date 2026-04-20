// pages/index.js
import { useState, useCallback } from 'react';
import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import { useGameState } from '@/hooks/useGameState';
import { buildLayout } from '@/lib/crosswordEngine';
import { SUBJECTS, FAILURE_MESSAGES, SUCCESS_MESSAGES, REPEATED_FAILURE_MSG,
         randomFrom, rankingUpMsg, rankingOvertakenMsg, getAvatarUrl } from '@/lib/juriMessages';
import Header from '@/components/layout/Header';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import FeedbackOverlay from '@/components/notifications/FeedbackOverlay';
import RankingToast from '@/components/notifications/RankingToast';
import RankingModal from '@/components/game/RankingModal';
import ContactModal from '@/components/layout/ContactModal';
import dynamic from 'next/dynamic';
import styles from '@/styles/Home.module.css';

// Dynamic import for CrosswordBoard (client-only, uses DOM refs)
const CrosswordBoard = dynamic(() => import('@/components/game/CrosswordBoard'), { ssr: false });

const ADMIN_EMAIL = 'pedrohenriqueinsec281@gmail.com';
const ADMIN_PHONE = '+5584991101624';
const MAX_HINTS   = 3;

export default function Home() {
  const { user, gameState, loading } = useAuth();

  // Modals
  const [loginOpen,    setLoginOpen]    = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [rankingOpen,  setRankingOpen]  = useState(false);
  const [contactOpen,  setContactOpen]  = useState(false);

  // Game state
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const gs = useGameState(subject);

  const [placedWords,  setPlacedWords]  = useState([]);
  const [gameVisible,  setGameVisible]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [feedback,     setFeedback]     = useState({ msg: '', type: '' });
  const [hintCount,    setHintCount]    = useState(0);
  const [revealUsed,   setRevealUsed]   = useState(false);
  const [levelDone,    setLevelDone]    = useState(false);
  const [showNextLvl,  setShowNextLvl]  = useState(false);

  // Overlay + toast
  const [overlay, setOverlay] = useState({ visible: false, icon: '', message: '', type: 'neutral' });
  const [toast,   setToast]   = useState({ visible: false, icon: '', message: '', type: 'neutral' });

  // Fail counter per phase
  const [failCounts, setFailCounts] = useState({});

  const isAdmin = user && (
    (user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ||
    user.phoneNumber === ADMIN_PHONE
  );

  // ---- Feedback helpers ----
  function showFeedback(msg, type, duration = 4000) {
    setFeedback({ msg, type });
    if (duration > 0) setTimeout(() => setFeedback({ msg: '', type: '' }), duration);
  }

  function showOverlay(icon, message, type) {
    setOverlay({ visible: true, icon, message, type });
  }

  function showToast(icon, message, type, duration = 6000) {
    setToast({ visible: true, icon, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), duration);
  }

  // ---- Generate ----
  async function handleGenerate() {
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
  }

  // ---- Level complete ----
  const handleSolved = useCallback(async () => {
    if (levelDone) return;
    setLevelDone(true);

    if (revealUsed) {
      showOverlay('⚠️', "Fase revelada! Você não pontuou. Clique em 'Próximo Nível' para continuar.", 'warning');
      await gs.unlockNextLevel();
      setShowNextLvl(true);
      return;
    }

    // Success
    showOverlay('⚖️', randomFrom(SUCCESS_MESSAGES), 'success');

    if (hintCount <= MAX_HINTS) await gs.addScore(100);
    await gs.addUsedWords(placedWords.map(w => w.answer));
    await gs.unlockNextLevel();
    setShowNextLvl(true);

    // Check ranking
    try {
      const res = await fetch('/api/get-ranking');
      if (res.ok) {
        const { ranking } = await res.json();
        const nickname = gameState?.nickname || user?.email?.split('@')[0] || '';
        const myEntry  = ranking.find(p => p.name?.toLowerCase() === nickname.toLowerCase());
        if (myEntry) {
          const myRank = ranking.indexOf(myEntry) + 1;
          // Simple check: if in top 3, show ranking toast
          if (myRank <= 3) showToast('📈', rankingUpMsg(nickname), 'success');
        }
      }
    } catch (_) {}
  }, [levelDone, revealUsed, hintCount, placedWords, gs, gameState, user]);

  // ---- Fail ----
  function handlePhaseFail() {
    const key   = `${subject}_${gs.level}`;
    const count = (failCounts[key] || 0) + 1;
    setFailCounts(p => ({ ...p, [key]: count }));
    if (count > 3) {
      showOverlay('📚', REPEATED_FAILURE_MSG, 'warning');
    } else {
      showOverlay('❌', randomFrom(FAILURE_MESSAGES), 'error');
    }
  }

  // ---- Hint ----
  function handleHint() {
    if (!window._crosswordRevealHint) return;
    const revealed = window._crosswordRevealHint();
    if (revealed) {
      const next = hintCount + 1;
      setHintCount(next);
      if (next <= MAX_HINTS) {
        showFeedback(`Você usou um coração! Restam ${MAX_HINTS - next}.`, 'info', 3000);
      } else {
        showFeedback('Atenção: Você perdeu todos os corações! Esta fase não renderá mais pontos.', 'error', 4000);
      }
    } else {
      showFeedback('Selecione uma dica primeiro.', 'error', 3000);
    }
  }

  // ---- Reveal All ----
  async function handleRevealAll() {
    if (!confirm('Tem certeza que deseja revelar todas as respostas? Você não pontuará nesta fase.')) return;
    setRevealUsed(true);
    await window._crosswordRevealAll?.();
  }

  // ---- Clear ----
  function handleClear() { window._crosswordClearAll?.(); }

  // ---- Next Level ----
  function handleNextLevel() {
    setShowNextLvl(false);
    setGameVisible(false);
    handleGenerate();
  }

  // ---- Reset ----
  async function handleReset() {
    const label = SUBJECTS.find(s => s === subject) || subject;
    if (!confirm(`Resetar progresso de "${label}"? Volta ao nível 1 e pontuação zerada.`)) return;
    await gs.resetProgress();
    setGameVisible(false);
    showFeedback('Progresso resetado!', 'info', 3000);
  }

  // ---- Admin seed ----
  async function handleAdminSeed() {
    const secret = prompt('Admin: Digite SEED_SECRET:');
    if (!secret) return;
    const lvl = prompt('Nível para gerar:', gs.level);
    if (!lvl) return;
    showFeedback('⏳ IA gerando perguntas…', 'info', 0);
    try {
      const res  = await fetch('/api/seed-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, subject, level: parseInt(lvl, 10) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showFeedback(`✅ ${data.message}`, 'success', 8000);
    } catch (err) {
      showFeedback(`❌ ${err.message}`, 'error', 8000);
    }
  }

  // ---- Hearts UI ----
  function renderHearts() {
    return Array.from({ length: MAX_HINTS }, (_, i) => i < hintCount ? '🤍' : '❤️').join('');
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading">
          <div className="loading__spinner" />
          <span>Carregando…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>JuriQuest — Cruzadinhas de Direito</title>
      </Head>

      <Header
        onLoginClick={() => setLoginOpen(true)}
        onRegisterClick={() => setRegisterOpen(true)}
        onRankingClick={() => setRankingOpen(true)}
        onContactClick={() => setContactOpen(true)}
      />

      <main className="app">
        {/* ---- Landing / Auth required ---- */}
        {!user && (
          <section className={styles.hero}>
            <div className={styles.heroContent}>

              <h1 className={styles.heroTitle}>Domine o Direito<br /><span>jogando.</span></h1>
              <p className={styles.heroSub}>
                Cruzadinhas jurídicas geradas por inteligência artificial. Treine para concursos e OAB com um método que gruda.
              </p>
              <div className={styles.heroCtas}>
                <button className="btn btn--primary" style={{fontSize:'1.1rem', padding:'14px 32px'}} onClick={() => setRegisterOpen(true)}>
                  Começar Grátis
                </button>
                <button className="btn btn--ghost" style={{fontSize:'1.1rem', padding:'14px 32px'}} onClick={() => setLoginOpen(true)}>
                  Já tenho conta
                </button>
              </div>
            </div>

            <div className={styles.features}>
              {[
                { icon: '🤖', title: 'IA Generativa', desc: 'Perguntas únicas geradas pelo Gemini a partir da legislação oficial.' },
                { icon: '📊', title: 'Ranking Global', desc: 'Compete com outros estudantes e sobe no placar em tempo real.' },
                { icon: '📚', title: '8 Matérias', desc: 'Constitucional, Penal, Civil, Trabalhista, Tributário e mais.' },
                { icon: '📱', title: 'Mobile First', desc: 'Jogue em qualquer dispositivo com notificações push.' },
              ].map(f => (
                <div key={f.title} className={styles.featureCard}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---- Game area ---- */}
        {user && (
          <>
            {/* Controls */}
            <section className={styles.controls}>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel} htmlFor="subject-select">Matéria</label>
                <select
                  id="subject-select"
                  className={styles.select}
                  value={subject}
                  onChange={e => { setSubject(e.target.value); setGameVisible(false); }}
                  aria-label="Escolha a matéria jurídica"
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Status</label>
                <div className={styles.statusDisplay}>
                  <span>Nível: <strong>{gs.level}</strong></span>
                  <span>Pontos: <strong>{gs.score}</strong></span>
                </div>
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Ações</label>
                <div className={styles.controlRow}>
                  {!showNextLvl ? (
                    <button
                      id="generate-btn"
                      className="btn btn--primary"
                      onClick={handleGenerate}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Gerando…' : `Iniciar Nível ${gs.level}`}
                    </button>
                  ) : (
                    <button id="next-level-btn" className="btn btn--primary" onClick={handleNextLevel}>
                      Próximo Nível
                    </button>
                  )}
                  <button className="btn btn--secondary" onClick={handleReset} title="Resetar progresso do tema">Resetar</button>
                  {isAdmin && (
                    <button className="btn" style={{background:'#dc2626',color:'#fff'}} onClick={handleAdminSeed}>
                      ⚙️ Admin: Gerar Fase
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Loading */}
            {isLoading && (
              <div className="loading" role="status" aria-live="polite">
                <div className="loading__spinner" aria-hidden="true" />
                <span>Gerando cruzadinha…</span>
              </div>
            )}

            {/* Inline feedback */}
            {feedback.msg && (
              <div className={`feedback feedback--${feedback.type}`} role="alert" aria-live="assertive">
                {feedback.msg}
              </div>
            )}

            {/* Hearts / Hints */}
            {gameVisible && !showNextLvl && (
              <div className={styles.hearts} aria-label={`Dicas restantes: ${MAX_HINTS - hintCount}`}>
                <span className={styles.heartsLabel}>Dicas Restantes:</span>
                <span className={styles.heartsIcons}>{renderHearts()}</span>
              </div>
            )}

            {/* Crossword */}
            {gameVisible && (
              <>
                <CrosswordBoard
                  placedWords={placedWords}
                  onSolved={handleSolved}
                />

                {/* Board action buttons */}
                {!showNextLvl && (
                  <div className={styles.boardActions}>
                    <button id="hint-btn"   className="btn btn--secondary" onClick={handleHint}>💡 Dica</button>
                    <button id="clear-btn"  className="btn btn--secondary" onClick={handleClear}>🗑 Limpar</button>
                    <button id="reveal-btn" className="btn btn--danger"    onClick={handleRevealAll}>👁 Revelar Tudo</button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* ---- Modals ---- */}
      <LoginModal    visible={loginOpen}    onClose={() => setLoginOpen(false)} />
      <RegisterModal visible={registerOpen} onClose={() => setRegisterOpen(false)} />
      <RankingModal  visible={rankingOpen}  onClose={() => setRankingOpen(false)} />
      <ContactModal  visible={contactOpen}  onClose={() => setContactOpen(false)} />

      {/* ---- Notifications ---- */}
      <FeedbackOverlay
        visible={overlay.visible}
        icon={overlay.icon}
        message={overlay.message}
        type={overlay.type}
        onClose={() => setOverlay(o => ({ ...o, visible: false }))}
      />
      <RankingToast
        visible={toast.visible}
        icon={toast.icon}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast(t => ({ ...t, visible: false }))}
      />
    </>
  );
}
