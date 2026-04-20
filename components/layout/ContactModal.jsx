import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import styles from '../auth/Modal.module.css'; // Reusing standard modal styles if possible, else Tailwind

export default function ContactModal({ visible, onClose }) {
  const { user } = useAuth();
  const [sentiment, setSentiment] = useState('positive'); // 'positive' or 'negative'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });
  const [copied, setCopied] = useState(false);

  if (!visible) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('playJuriQuest@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className={`${styles.modal} bg-gray-900 border border-gray-700`} role="dialog" aria-modal="true" style={{ maxWidth: '500px' }}>
        <button className={styles.close} onClick={onClose} aria-label="Fechar">×</button>
        <h2 className="text-xl font-bold text-white mb-4">Contato & Feedback</h2>

        {/* Email Copy Area */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6 flex items-center justify-between border border-gray-700">
          <div>
            <p className="text-sm text-gray-400 mb-1">Email de suporte:</p>
            <p className="font-mono text-blue-400">playJuriQuest@gmail.com</p>
          </div>
          <button 
            onClick={handleCopyEmail}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded-md transition-colors"
          >
            {copied ? '✅ Copiado' : '📋 Copiar'}
          </button>
        </div>

        <div className="border-t border-gray-700 pt-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Deixe seu feedback para nós</h3>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Sentiment Selector */}
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setSentiment('positive')}
                className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                  sentiment === 'positive' 
                    ? 'bg-green-600/20 border-green-500 text-green-400' 
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <span>🟢</span> Elogio / Ideia
              </button>
              <button 
                type="button"
                onClick={() => setSentiment('negative')}
                className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                  sentiment === 'negative' 
                    ? 'bg-red-600/20 border-red-500 text-red-400' 
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <span>🔴</span> Crítica / Erro
              </button>
            </div>

            {/* Message Area */}
            <textarea 
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="O que você achou do jogo? Encontrou algum problema?"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none text-sm"
              required
            ></textarea>

            {/* Feedback Response */}
            {feedbackMsg.text && (
              <p className={`text-sm text-center ${feedbackMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {feedbackMsg.text}
              </p>
            )}

            {/* Submit */}
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
    </div>
  );
}
