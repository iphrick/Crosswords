import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

export default function ContactModal({ visible, onClose }) {
  const { user } = useAuth();

  // Tabs: 'feedback' | 'donate'
  const [activeTab, setActiveTab] = useState('feedback');

  // Feedback State
  const [sentiment, setSentiment] = useState('positive');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  // Copy States
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  // PIX Data
  const PIX_CHAVE_COPIA_COLA = "00020126580014br.gov.bcb.pix0136012437e8-14de-43c8-85a3-c1cbb940a3755204000053039865802BR5925PEDRO HENRIQUE CLEMENTINO6009Sao Paulo62290525REC69E64BB02C3E719732270963040B47";
  const PIX_QR_CODE_IMG = "img-pix.jpeg";

  if (!visible) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('playJuriQuest@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_CHAVE_COPIA_COLA);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // 1. Payload Sanitization & Validation
    const sanitizedMessage = message.trim();
    if (!sanitizedMessage) return;

    // 2. Auth Verification
    if (!user && !confirm('Você está enviando como anônimo. Deseja continuar?')) {
      return;
    }

    setLoading(true);
    setFeedbackMsg({ text: '', type: '' });

    // 3. Debugging Logs (Development Only)
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      console.group('🚀 [JuriQuest Debug] - Feedback Submission');
      console.log('Step 1: Auth Check...', user ? 'Authenticated' : 'Anonymous');
      console.log('Step 2: Payload Serialization...', { sentiment, message: sanitizedMessage, timestamp: new Date().toISOString() });
    }

    try {
      if (isDev) console.log('Step 3: Server Request (Firestore)...');

      // 4. Request Logic
      await addDoc(collection(db, 'feedbacks'), {
        uid: user?.uid || 'anonymous',
        email: user?.email || 'Anônimo',
        sentiment,
        message: sanitizedMessage,
        createdAt: serverTimestamp(),
        deviceInfo: {
          platform: navigator.platform,
          userAgent: navigator.userAgent
        }
      });

      if (isDev) {
        console.log('✅ Step 4: Server Response: Success');
        console.groupEnd();
      }

      setFeedbackMsg({ text: 'Feedback enviado com sucesso! Obrigado.', type: 'success' });
      setMessage('');
      
      setTimeout(() => {
        onClose();
        setFeedbackMsg({ text: '', type: '' });
      }, 2500);

    } catch (error) {
      // 5. Error Categorization & Handling
      if (isDev) {
        console.error('❌ Step 4: Server Response: FAILED', error);
        console.groupEnd();
      }

      const errorMsg = error.code === 'permission-denied' 
        ? 'Acesso negado. Por favor, faça login novamente.'
        : 'Ops! Tivemos um problema técnico. Por favor, tente novamente em alguns instantes.';

      setFeedbackMsg({ text: errorMsg, type: 'error' });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(2, 6, 14, 0.80)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        padding: '16px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: '#080c14',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '28px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset',
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: '28px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'Inter, system-ui, sans-serif' }}>
            Contato & Apoio
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.35)', fontSize: '18px', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
          >
            ×
          </button>
        </div>

        {/* ── Subtitle ── */}
        <p style={{ margin: 0, padding: '8px 28px 0', fontSize: '13px', color: 'rgba(255,255,255,0.40)', fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'center', lineHeight: 1.5 }}>
          Fale conosco ou ajude o projeto a crescer.
        </p>

        {/* ── Pill Tabs ── */}
        <div style={{ padding: '20px 28px 0' }}>
          <div style={{
            display: 'flex', gap: '4px', padding: '4px',
            background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <button
              onClick={() => setActiveTab('feedback')}
              style={{
                flex: 1, padding: '10px 0', fontSize: '13px', fontWeight: 700,
                fontFamily: 'Inter, system-ui, sans-serif', borderRadius: '12px',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                background: activeTab === 'feedback' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeTab === 'feedback' ? '#fff' : 'rgba(255,255,255,0.30)',
                boxShadow: activeTab === 'feedback' ? '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)' : 'none'
              }}
            >
              Feedback
            </button>
            <button
              onClick={() => setActiveTab('donate')}
              style={{
                flex: 1, padding: '10px 0', fontSize: '13px', fontWeight: 700,
                fontFamily: 'Inter, system-ui, sans-serif', borderRadius: '12px',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                background: activeTab === 'donate' ? '#c9a96e' : 'transparent',
                color: activeTab === 'donate' ? '#080c14' : 'rgba(255,255,255,0.30)',
                boxShadow: activeTab === 'donate' ? '0 4px 20px rgba(201,169,110,0.25)' : 'none'
              }}
            >
              Apoiar o Projeto
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {activeTab === 'feedback' && (
            <>
              {/* Email Support */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.025)', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)', padding: '16px 20px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.30)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                    Suporte via E-mail
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#6ba3f7', fontFamily: 'ui-monospace, monospace' }}>
                    playJuriQuest@gmail.com
                  </span>
                </div>
                <button
                  onClick={handleCopyEmail}
                  style={{
                    padding: '8px 16px', fontSize: '11px', fontWeight: 700,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    background: copiedEmail ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                    color: copiedEmail ? '#34d399' : 'rgba(255,255,255,0.6)',
                    border: `1px solid ${copiedEmail ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {copiedEmail ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>

              {/* Feedback Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Sentiment Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.30)', fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'center' }}>
                    Qual o seu feedback?
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setSentiment('positive')}
                      style={{
                        flex: 1, padding: '14px 12px', borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        cursor: 'pointer', transition: 'all 0.25s', border: 'none',
                        background: sentiment === 'positive' ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.025)',
                        outline: sentiment === 'positive' ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: sentiment === 'positive' ? '#10b981' : 'rgba(255,255,255,0.12)',
                        boxShadow: sentiment === 'positive' ? '0 0 12px rgba(16,185,129,0.7)' : 'none',
                        transition: 'all 0.25s'
                      }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif', color: sentiment === 'positive' ? '#34d399' : 'rgba(255,255,255,0.30)' }}>
                        Elogio / Ideia
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSentiment('negative')}
                      style={{
                        flex: 1, padding: '14px 12px', borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        cursor: 'pointer', transition: 'all 0.25s', border: 'none',
                        background: sentiment === 'negative' ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.025)',
                        outline: sentiment === 'negative' ? '1px solid rgba(244,63,94,0.35)' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: sentiment === 'negative' ? '#f43f5e' : 'rgba(255,255,255,0.12)',
                        boxShadow: sentiment === 'negative' ? '0 0 12px rgba(244,63,94,0.7)' : 'none',
                        transition: 'all 0.25s'
                      }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif', color: sentiment === 'negative' ? '#fb7185' : 'rgba(255,255,255,0.30)' }}>
                        Crítica / Erro
                      </span>
                    </button>
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Conte-nos o que você achou do JuriQuest..."
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box', resize: 'none',
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px', padding: '18px 20px',
                    color: 'rgba(255,255,255,0.85)', fontSize: '14px', lineHeight: 1.6,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none'; }}
                />

                {/* Status Message */}
                {feedbackMsg.text && (
                  <div style={{
                    padding: '14px 18px', borderRadius: '14px',
                    display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center',
                    fontSize: '12px', fontWeight: 700, textAlign: 'center',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    background: feedbackMsg.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
                    color: feedbackMsg.type === 'success' ? '#34d399' : '#fb7185',
                    border: `1px solid ${feedbackMsg.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`
                  }}>
                    <span>{feedbackMsg.text}</span>
                    {feedbackMsg.type === 'error' && (
                      <button
                        type="button"
                        onClick={() => handleSubmit()}
                        style={{
                          background: 'rgba(244,63,94,0.12)', color: '#fb7185',
                          border: '1px solid rgba(244,63,94,0.25)', borderRadius: '10px',
                          padding: '8px 20px', fontSize: '11px', fontWeight: 700,
                          fontFamily: 'Inter, system-ui, sans-serif', cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        Tentar Novamente
                      </button>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  style={{
                    width: '100%', padding: '16px 0', fontSize: '14px', fontWeight: 800,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    background: loading || !message.trim() ? 'rgba(201,169,110,0.15)' : 'linear-gradient(135deg, #c9a96e, #b8944f)',
                    color: loading || !message.trim() ? 'rgba(201,169,110,0.4)' : '#080c14',
                    border: 'none', borderRadius: '16px', cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: loading || !message.trim() ? 'none' : '0 6px 24px rgba(201,169,110,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '16px', height: '16px', border: '2px solid rgba(8,12,20,0.2)',
                        borderTopColor: '#080c14', borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite', display: 'inline-block'
                      }} />
                      Enviando...
                    </span>
                  ) : 'Enviar para os Desenvolvedores'}
                </button>
              </form>
            </>
          )}

          {activeTab === 'donate' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              {/* Donation Card */}
              <div style={{
                width: '100%', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px',
                padding: '32px 24px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Apoie o Desenvolvimento
                </h3>
                <p style={{ margin: '0 0 28px', fontSize: '13px', color: 'rgba(255,255,255,0.40)', lineHeight: 1.6, maxWidth: '300px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Sua contribuição ajuda a manter os servidores ativos e a trazer novas cruzadinhas jurídicas todos os dias.
                </p>

                <div style={{ position: 'relative', padding: '20px', background: '#fff', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                  <img src={PIX_QR_CODE_IMG} alt="QR Code do PIX" style={{ width: '180px', height: '180px', objectFit: 'contain', borderRadius: '12px', display: 'block' }} />
                  <div style={{
                    position: 'absolute', bottom: '-10px', right: '-10px',
                    background: '#c9a96e', color: '#080c14',
                    fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em',
                    padding: '6px 14px', borderRadius: '20px',
                    boxShadow: '0 4px 16px rgba(201,169,110,0.3)',
                    border: '3px solid #080c14', fontFamily: 'Inter, system-ui, sans-serif'
                  }}>
                    PIX SEGURO
                  </div>
                </div>
              </div>

              {/* PIX Copy */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Pix Copia e Cola
                </label>
                <div style={{
                  display: 'flex', background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px',
                  padding: '4px', gap: '4px', alignItems: 'stretch'
                }}>
                  <input
                    type="text"
                    readOnly
                    value={PIX_CHAVE_COPIA_COLA}
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      color: 'rgba(255,255,255,0.35)', fontSize: '11px', padding: '12px 16px',
                      fontFamily: 'ui-monospace, monospace', minWidth: 0
                    }}
                  />
                  <button
                    onClick={handleCopyPix}
                    style={{
                      background: copiedPix ? 'rgba(16,185,129,0.15)' : '#c9a96e',
                      color: copiedPix ? '#34d399' : '#080c14',
                      border: copiedPix ? '1px solid rgba(16,185,129,0.3)' : 'none',
                      padding: '12px 24px', fontSize: '11px', fontWeight: 800,
                      fontFamily: 'Inter, system-ui, sans-serif',
                      borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      boxShadow: copiedPix ? 'none' : '0 2px 12px rgba(201,169,110,0.2)'
                    }}
                  >
                    {copiedPix ? '✓ Copiado' : 'Copiar Chave'}
                  </button>
                </div>
              </div>

              <p style={{ margin: '8px 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.15)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Inter, system-ui, sans-serif' }}>
                JuriQuest • Feito por e para Advogados
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
