'use strict';

/* =============================================
   JURIQUEST — SISTEMA DE NOTIFICAÇÕES E FEEDBACK
   Módulo autônomo. Inclua após script.js no HTML.
   ============================================= */

/* --------------------------------------------------
   1. MENSAGENS JURÍDICAS
   -------------------------------------------------- */
const JuriMessages = {
  // Mensagens de FALHA na fase
  failure: [
    'IMPROCEDENTE POR UNANIMIDADE!',
    'INDEFERIDO!',
    'REPROVADO NOS AUTOS!',
    'ARQUIVADO POR FALTA DE ACERTOS!'
  ],

  // Mensagem especial após 3+ falhas na mesma fase
  repeatedFailure: 'Volte para os estudos, doutor(a).',

  // Mensagens de SUCESSO na fase
  success: [
    'NEM CABE RECURSO!',
    'DECISÃO FAVORÁVEL!',
    'ACERTO IRREFUTÁVEL!',
    'DESEMPENHO MERITÓRIO!'
  ],

  // Mensagem de subida no ranking
  rankingUp: (name) => `Muito bem Dr(a) ${name}, o Senhor está LOGRANDO ÊXITO no ranking.`,

  // Mensagem de ser ultrapassado
  rankingOvertaken: (overtakerName) => `O usuário ${overtakerName} PRETERIU você.`,

  // Retorna mensagem aleatória de um array
  random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
};

/* --------------------------------------------------
   2. OVERLAY DE FEEDBACK VISUAL (Tela cheia no mobile)
   -------------------------------------------------- */
const JuriFeedbackOverlay = {
  el: null,

  init() {
    if (this.el) return;
    this.el = document.createElement('div');
    this.el.id = 'juri-overlay';
    this.el.setAttribute('role', 'alert');
    this.el.setAttribute('aria-live', 'assertive');
    this.el.innerHTML = `
      <div id="juri-overlay__card">
        <div id="juri-overlay__icon" aria-hidden="true"></div>
        <div id="juri-overlay__message"></div>
        <button id="juri-overlay__close" aria-label="Fechar">OK, Excelência!</button>
      </div>
    `;

    // Estilos inline mínimos para garantir que funciona sem CSS externo
    Object.assign(this.el.style, {
      position: 'fixed', inset: '0', zIndex: '9998',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      opacity: '0', visibility: 'hidden',
      transition: 'opacity 0.3s ease, visibility 0.3s ease',
      padding: '20px', boxSizing: 'border-box'
    });

    const card = this.el.querySelector('#juri-overlay__card');
    Object.assign(card.style, {
      background: 'linear-gradient(135deg, #161b27 0%, #1e2535 100%)',
      border: '1px solid rgba(201,169,110,0.3)',
      borderRadius: '20px',
      padding: '40px 30px',
      maxWidth: '420px',
      width: '100%',
      textAlign: 'center',
      transform: 'scale(0.85)',
      transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,169,110,0.1)'
    });

    const icon = this.el.querySelector('#juri-overlay__icon');
    Object.assign(icon.style, { fontSize: '4rem', marginBottom: '16px', lineHeight: '1' });

    const msg = this.el.querySelector('#juri-overlay__message');
    Object.assign(msg.style, {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
      fontWeight: '700',
      color: '#c9a96e',
      lineHeight: '1.3',
      marginBottom: '28px',
      letterSpacing: '-0.01em'
    });

    const btn = this.el.querySelector('#juri-overlay__close');
    Object.assign(btn.style, {
      background: 'linear-gradient(135deg, #c9a96e, #e4c07a)',
      color: '#0e1117',
      border: 'none',
      borderRadius: '10px',
      padding: '14px 32px',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      boxShadow: '0 4px 15px rgba(201,169,110,0.3)'
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 6px 20px rgba(201,169,110,0.4)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.boxShadow = '0 4px 15px rgba(201,169,110,0.3)';
    });
    btn.addEventListener('click', () => this.hide());

    // Fechar ao clicar fora do card
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.hide();
    });

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) this.hide();
    });

    document.body.appendChild(this.el);
  },

  show(icon, message, type = 'neutral') {
    this.init();
    const colorMap = {
      success: '#4caf7d',
      error: '#e05c5c',
      warning: '#f59e0b',
      neutral: '#c9a96e'
    };

    const msg = this.el.querySelector('#juri-overlay__message');
    const iconEl = this.el.querySelector('#juri-overlay__icon');
    const card = this.el.querySelector('#juri-overlay__card');
    const closeBtn = this.el.querySelector('#juri-overlay__close');

    iconEl.textContent = icon;
    msg.textContent = message;
    msg.style.color = colorMap[type] || colorMap.neutral;

    // Cor da borda do card conforme tipo
    card.style.borderColor = (colorMap[type] || colorMap.neutral).replace(')', ', 0.4)').replace('rgb', 'rgba');

    // Cor do botão também muda
    if (type === 'success') {
      closeBtn.style.background = 'linear-gradient(135deg, #4caf7d, #66bb99)';
    } else if (type === 'error') {
      closeBtn.style.background = 'linear-gradient(135deg, #e05c5c, #f07070)';
    } else {
      closeBtn.style.background = 'linear-gradient(135deg, #c9a96e, #e4c07a)';
    }

    // Animação de entrada
    this.el.style.opacity = '1';
    this.el.style.visibility = 'visible';

    requestAnimationFrame(() => {
      card.style.transform = 'scale(1)';
    });

    // Vibração mobile para erros
    if (type === 'error' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
    // Vibração de sucesso
    if (type === 'success' && navigator.vibrate) {
      navigator.vibrate([50, 30, 100]);
    }
  },

  hide() {
    if (!this.el) return;
    const card = this.el.querySelector('#juri-overlay__card');
    this.el.style.opacity = '0';
    this.el.style.visibility = 'hidden';
    card.style.transform = 'scale(0.85)';
  },

  isVisible() {
    return this.el && this.el.style.opacity === '1';
  }
};

/* --------------------------------------------------
   3. TOAST DE RANKING (banner no topo, menos invasivo)
   -------------------------------------------------- */
const RankingToast = {
  el: null,
  _timer: null,

  init() {
    if (this.el) return;
    this.el = document.createElement('div');
    this.el.id = 'ranking-toast';
    Object.assign(this.el.style, {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%) translateY(-120px)',
      zIndex: '9997',
      background: 'linear-gradient(135deg, #1e2535, #263045)',
      border: '1px solid rgba(201,169,110,0.4)',
      borderRadius: '50px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      maxWidth: '90vw',
      cursor: 'pointer',
      userSelect: 'none',
      backdropFilter: 'blur(10px)'
    });
    this.el.addEventListener('click', () => this.dismiss());
    document.body.appendChild(this.el);
  },

  show(icon, message, type = 'neutral', duration = 5000) {
    this.init();
    clearTimeout(this._timer);

    const colorMap = { success: '#4caf7d', error: '#e05c5c', warning: '#f59e0b', neutral: '#c9a96e' };
    const color = colorMap[type] || colorMap.neutral;

    this.el.innerHTML = `
      <span style="font-size:1.4rem">${icon}</span>
      <span style="font-family:'DM Sans',sans-serif; font-size:0.9rem; font-weight:600; color:${color}; line-height:1.3">${message}</span>
    `;

    this.el.style.borderColor = `${color}66`;

    // Slide down
    requestAnimationFrame(() => {
      this.el.style.transform = 'translateX(-50%) translateY(0)';
    });

    if (duration > 0) {
      this._timer = setTimeout(() => this.dismiss(), duration);
    }
  },

  dismiss() {
    if (!this.el) return;
    this.el.style.transform = 'translateX(-50%) translateY(-120px)';
  }
};

/* --------------------------------------------------
   4. SISTEMA DE NOTIFICAÇÕES PUSH
   -------------------------------------------------- */
const PushNotifications = {
  _swRegistration: null,
  _permission: 'default',

  async init() {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      console.warn('[PushNotifications] Não suportado neste browser.');
      return;
    }

    try {
      // Registra o Service Worker
      this._swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('[PushNotifications] Service Worker registrado:', this._swRegistration.scope);

      // Verifica permissão atual
      this._permission = Notification.permission;

      // Ouve mensagens do SW (ranking updates em background)
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'RANKING_UPDATE') {
          RankingNotifier.checkOvertake(event.data.ranking);
        }
      });

    } catch (err) {
      console.error('[PushNotifications] Falha ao registrar SW:', err);
    }
  },

  async requestPermission() {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';

    const result = await Notification.requestPermission();
    this._permission = result;
    return result;
  },

  async sendLocal(title, body, options = {}) {
    const permission = await this.requestPermission();
    if (permission !== 'granted') return;

    if (this._swRegistration) {
      await this._swRegistration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        vibrate: [200, 100, 200],
        tag: options.tag || 'juriquest',
        renotify: true,
        ...options
      });
    } else {
      // Fallback: Notification API direta
      new Notification(title, { body, icon: '/icon-192.png', ...options });
    }
  }
};

/* --------------------------------------------------
   5. NOTIFICADOR DE RANKING
   -------------------------------------------------- */
const RankingNotifier = {
  _lastRanking: null,   // snapshot anterior do ranking
  _currentUserName: null,
  _lastUserRank: null,
  _checkInterval: null,

  init(userName) {
    this._currentUserName = userName;
  },

  startPolling(intervalMs = 60000) {
    this.stopPolling();
    this._checkInterval = setInterval(() => this._fetchAndCheck(), intervalMs);
  },

  stopPolling() {
    if (this._checkInterval) {
      clearInterval(this._checkInterval);
      this._checkInterval = null;
    }
  },

  async _fetchAndCheck() {
    try {
      const res = await fetch('/api/get-ranking');
      if (!res.ok) return;
      const data = await res.json();
      this.checkOvertake(data.ranking);
    } catch (e) {
      // Silencioso — não atrapalha o jogo
    }
  },

  checkOvertake(newRanking) {
    if (!newRanking || !this._currentUserName) return;

    const myEntry = newRanking.find(p =>
      p.name && p.name.toLowerCase() === this._currentUserName.toLowerCase()
    );

    if (!myEntry) return;

    const myNewRank = newRanking.indexOf(myEntry) + 1;

    // Verificar se subiu no ranking
    if (this._lastUserRank !== null && myNewRank < this._lastUserRank) {
      // Subiu! Mostrar toast de vitória
      RankingToast.show(
        '📈',
        JuriMessages.rankingUp(this._currentUserName),
        'success',
        7000
      );
    }

    // Verificar se foi ultrapassado (desceu no ranking)
    if (this._lastRanking && this._lastUserRank !== null && myNewRank > this._lastUserRank) {
      // Quem me ultrapassou?
      const prevIdsAboveMe = this._lastRanking
        .slice(0, this._lastUserRank - 1)
        .map(p => p.name);

      const newIdsAboveMe = newRanking
        .slice(0, myNewRank - 1)
        .map(p => p.name);

      // Novos usuários que agora estão acima de mim
      const overtakers = newIdsAboveMe.filter(name => !prevIdsAboveMe.includes(name));

      overtakers.forEach(async (name) => {
        const msg = JuriMessages.rankingOvertaken(name);

        // Toast in-app
        RankingToast.show('⚠️', msg, 'warning', 8000);

        // Push notification (mesmo com app em background)
        await PushNotifications.sendLocal('⚖️ JuriQuest — Ranking', msg, {
          tag: `overtaken-${name}`,
          vibrate: [300, 100, 300, 100, 300]
        });
      });
    }

    // Atualiza snapshots
    this._lastRanking = [...newRanking];
    this._lastUserRank = myNewRank;
  }
};

/* --------------------------------------------------
   6. SISTEMA DE FALHAS POR FASE
   -------------------------------------------------- */
const PhaseFailTracker = {
  _failCounts: {}, // { "Direito Penal_5": 2, ... }

  _key(subject, level) {
    return `${subject}_${level}`;
  },

  recordFail(subject, level) {
    const key = this._key(subject, level);
    this._failCounts[key] = (this._failCounts[key] || 0) + 1;
    return this._failCounts[key];
  },

  getCount(subject, level) {
    return this._failCounts[this._key(subject, level)] || 0;
  },

  reset(subject, level) {
    delete this._failCounts[this._key(subject, level)];
  }
};

/* --------------------------------------------------
   7. API PÚBLICA — Use estas funções para integrar
   -------------------------------------------------- */
const JuriNotify = {

  /**
   * Inicializa todo o sistema.
   * @param {string} userName - Nome de exibição do usuário logado
   */
  async setup(userName) {
    await PushNotifications.init();
    RankingNotifier.init(userName);

    // Inicia polling de ranking a cada 60 segundos
    RankingNotifier.startPolling(60000);

    // Pede permissão de notificação após 3 segundos (menos intrusivo)
    setTimeout(async () => {
      if (Notification.permission === 'default') {
        const perm = await PushNotifications.requestPermission();
        if (perm === 'granted') {
          RankingToast.show('🔔', 'Notificações ativadas! Você será avisado sobre mudanças no ranking.', 'success', 4000);
        }
      }
    }, 3000);
  },

  /**
   * Chamar quando o usuário PASSA de fase.
   */
  onPhaseSuccess(subject, level) {
    PhaseFailTracker.reset(subject, level);
    const msg = JuriMessages.random(JuriMessages.success);
    JuriFeedbackOverlay.show('⚖️', msg, 'success');
  },

  /**
   * Chamar quando o usuário FALHA em uma fase.
   * @param {string} subject - Matéria
   * @param {number} level - Nível atual
   */
  onPhaseFail(subject, level) {
    const count = PhaseFailTracker.recordFail(subject, level);

    if (count > 3) {
      JuriFeedbackOverlay.show('📚', JuriMessages.repeatedFailure, 'warning');
    } else {
      const msg = JuriMessages.random(JuriMessages.failure);
      JuriFeedbackOverlay.show('❌', msg, 'error');
    }
  },

  /**
   * Chamar ao detectar mudança no ranking.
   * @param {Array} newRanking - Array atualizado do ranking
   */
  onRankingUpdate(newRanking) {
    RankingNotifier.checkOvertake(newRanking);
  },

  /**
   * Parar polling ao fazer logout.
   */
  teardown() {
    RankingNotifier.stopPolling();
  }
};

// Expõe globalmente para integração com script.js
window.JuriNotify = JuriNotify;
window.RankingToast = RankingToast;
window.JuriFeedbackOverlay = JuriFeedbackOverlay;
