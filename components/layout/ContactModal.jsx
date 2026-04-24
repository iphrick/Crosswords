import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import styles from '../auth/Modal.module.css';

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
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setFeedbackMsg({ text: '', type: '' });

    try {
      await addDoc(collection(db, 'feedbacks'), {
        uid: user?.uid || 'anonymous',
        email: user?.email || 'Anônimo',
        sentiment,
        message: message.trim(),
        createdAt: serverTimestamp()
      });
      setFeedbackMsg({ text: 'Feedback enviado com sucesso! Obrigado.', type: 'success' });
      setMessage('');
      setTimeout(() => {
        onClose();
        setFeedbackMsg({ text: '', type: '' });
      }, 2500);
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      setFeedbackMsg({ text: 'Erro ao enviar. Tente novamente mais tarde.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`${styles.modal} bg-[#0e1117] border border-slate-800 p-0 overflow-hidden flex flex-col`} role="dialog" aria-modal="true" style={{ maxWidth: '480px' }}>
        
        {/* Header Section */}
        <div className="p-6 pb-0 relative">
          <button className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors text-2xl leading-none" onClick={onClose} aria-label="Fechar">×</button>
          <h2 className="text-2xl font-bold text-white tracking-tight">Contato & Apoio</h2>
          <p className="text-slate-400 text-sm mt-1">Fale conosco ou ajude o projeto a crescer.</p>
        </div>

        {/* Minimalist Tabs */}
        <div className="px-6 mt-6">
          <div className="flex bg-slate-900/50 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === 'feedback' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Feedback
            </button>
            <button
              onClick={() => setActiveTab('donate')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === 'donate' ? 'bg-[#c9a96e] text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Apoiar o Projeto
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'feedback' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Email Support Card */}
              <div className="bg-slate-900/40 p-4 rounded-xl mb-6 border border-slate-800/50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider mb-1">Suporte via E-mail</span>
                  <span className="text-sm font-medium text-blue-400 font-mono">playJuriQuest@gmail.com</span>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-lg transition-all border border-slate-700"
                >
                  {copiedEmail ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="mb-2">
                  <label className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider block mb-4">Qual o seu feedback?</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setSentiment('positive')}
                      className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${sentiment === 'positive'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 ring-1 ring-emerald-500/30'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${sentiment === 'positive' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-700'}`}></span>
                      <span className="text-sm font-bold">Elogio / Ideia</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setSentiment('negative')}
                      className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${sentiment === 'negative'
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 ring-1 ring-rose-500/30'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${sentiment === 'negative' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-slate-700'}`}></span>
                      <span className="text-sm font-bold">Crítica / Erro</span>
                    </button>
                  </div>
                </div>

                <div className="relative group mt-2">
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Conte-nos o que você achou do JuriQuest..."
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#c9a96e]/50 focus:ring-1 focus:ring-[#c9a96e]/20 transition-all text-sm resize-none"
                    required
                  ></textarea>
                </div>

                {feedbackMsg.text && (
                  <div className={`p-3 rounded-lg text-xs font-bold text-center animate-in zoom-in-95 ${feedbackMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {feedbackMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="w-full py-4 bg-[#c9a96e] hover:bg-[#d4b47a] disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-extrabold rounded-xl transition-all shadow-xl shadow-[#c9a96e]/5 flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                      Enviando...
                    </span>
                  ) : 'Enviar para os Desenvolvedores'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'donate' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center">
              <div className="w-full bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6 mb-6">
                <div className="flex justify-center mb-6">
                  <div className="relative p-3 bg-white rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                    <img src={PIX_QR_CODE_IMG} alt="QR Code do PIX" className="w-56 h-56 object-contain rounded-xl" />
                    <div className="absolute -bottom-2 -right-2 bg-[#c9a96e] text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">
                      PIX SEGURO
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 text-center">Apoie o Desenvolvimento</h3>
                <p className="text-sm text-slate-400 text-center leading-relaxed max-w-[320px] mx-auto">
                  Sua contribuição ajuda a manter os servidores ativos e a trazer novas cruzadinhas jurídicas todos os dias para a comunidade.
                </p>
              </div>

              <div className="w-full">
                <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider block mb-3 text-center">Pix Copia e Cola</span>
                <div className="flex bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-1 shadow-inner">
                  <input
                    type="text"
                    readOnly
                    value={PIX_CHAVE_COPIA_COLA}
                    className="bg-transparent text-slate-400 text-xs px-4 py-3 flex-1 focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyPix}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 text-xs font-bold transition-all rounded-lg border border-slate-700 shadow-lg"
                  >
                    {copiedPix ? 'Copiado!' : 'Copiar Chave'}
                  </button>
                </div>
              </div>
              
              <p className="mt-8 text-[10px] text-slate-600 font-medium">JuriQuest • Feito com dedicação para estudantes de Direito</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
