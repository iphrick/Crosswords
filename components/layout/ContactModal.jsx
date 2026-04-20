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

  // DADOS DO PIX (Substitua pelos seus dados reais)
  const PIX_CHAVE_COPIA_COLA = "00020126580014br.gov.bcb.pix0136012437e8-14de-43c8-85a3-c1cbb940a3755204000053039865802BR5925PEDRO HENRIQUE CLEMENTINO6009Sao Paulo62290525REC69E64BB02C3E719732270963040B47"; // Substitua por seu código real
  const PIX_QR_CODE_IMG = "img-pix.jpeg"; // Opcional: coloque o caminho da imagem do QR code, ex: "/pix-qrcode.png"

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
      }, 2000);
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      setFeedbackMsg({ text: 'Erro ao enviar. Tente novamente mais tarde.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`${styles.modal} bg-gray-900 border border-gray-700 flex flex-col`} role="dialog" aria-modal="true" style={{ maxWidth: '500px' }}>
        <button className={styles.close} onClick={onClose} aria-label="Fechar">×</button>
        <h2 className="text-xl font-bold text-white mb-4">Contato & Apoio</h2>

        {/* Custom Tabs */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-6 border border-gray-700">
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'feedback' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Feedback
          </button>
          <button
            onClick={() => setActiveTab('donate')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'donate' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
          >
            💚 Apoiar o Projeto
          </button>
        </div>

        {activeTab === 'feedback' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Email Copy Area */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6 flex items-center justify-between border border-gray-700">
              <div>
                <p className="text-sm text-gray-400 mb-1">Email de suporte:</p>
                <p className="font-mono text-blue-400 text-sm md:text-base">playJuriQuest@gmail.com</p>
              </div>
              <button
                onClick={handleCopyEmail}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded-md transition-colors whitespace-nowrap ml-2"
              >
                {copiedEmail ? '✅ Copiado' : '📋 Copiar'}
              </button>
            </div>

            <div className="border-t border-gray-700 pt-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Deixe seu feedback para nós</h3>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSentiment('positive')}
                    className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${sentiment === 'positive'
                      ? 'bg-green-600/20 border-green-500 text-green-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                      }`}
                  >
                    <span>🟢</span> Elogio / Ideia
                  </button>
                  <button
                    type="button"
                    onClick={() => setSentiment('negative')}
                    className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${sentiment === 'negative'
                      ? 'bg-red-600/20 border-red-500 text-red-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                      }`}
                  >
                    <span>🔴</span> Crítica / Erro
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="O que você achou do jogo? Encontrou algum problema?"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none text-sm"
                  required
                ></textarea>

                {feedbackMsg.text && (
                  <p className={`text-sm text-center ${feedbackMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {feedbackMsg.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors mt-2"
                >
                  {loading ? 'Enviando...' : 'Enviar Feedback'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'donate' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center text-center pb-4">
            <div className="mb-4">
              <span className="text-4xl">☕</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ajude o JuriQuest a crescer!</h3>
            <p className="text-sm text-gray-400 mb-6 px-4 max-w-[400px]">
              O projeto é gratuito, mas requer empenho e tempo dedicados assim como custos com servidores.
              Qualquer contribuição via PIX nos ajuda a continuar melhorando e deixando o JuriQuest exatamente como vocês gostam.
            </p>

            <div className="flex justify-center w-full mb-6">
              <div className="bg-white p-3 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.1)] flex items-center justify-center">
                {PIX_QR_CODE_IMG ? (
                  <img src={PIX_QR_CODE_IMG} alt="QR Code do PIX" className="w-64 h-64 object-contain" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <div className="text-center px-4">
                      <p className="text-gray-800 text-sm font-bold mb-1">Seu QR Code Aqui</p>
                      <p className="text-gray-400 text-[10px] leading-tight">
                        Adicione a imagem na pasta public e atualize o código.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full max-w-[320px]">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Ou use o Pix Copia e Cola:</p>
              <div className="flex bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <input
                  type="text"
                  readOnly
                  value={PIX_CHAVE_COPIA_COLA}
                  className="bg-transparent text-gray-300 text-sm px-3 py-2 flex-1 focus:outline-none w-full min-w-0"
                />
                <button
                  onClick={handleCopyPix}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap"
                >
                  {copiedPix ? 'Copiado!' : 'Copiar PIX'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
