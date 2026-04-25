// components/auth/LoginModal.jsx
import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase-client';
import styles from './Modal.module.css';

export default function LoginModal({ visible, onClose }) {
  const { login, sendPhoneCode } = useAuth();
  const [tab,  setTab]  = useState('email'); // 'email' | 'phone'
  const [step, setStep] = useState('phone'); // 'phone' | 'code'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const confirmRef = useRef(null);
  const recaptchaRef = useRef(null);

  if (!visible) return null;

  useEffect(() => {
    if (visible && tab === 'phone' && step === 'phone') {
      const initRecaptcha = async () => {
        try {
          const { RecaptchaVerifier } = await import('firebase/auth');
          if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              size: 'invisible',
              callback: () => {}
            });
            await window.recaptchaVerifier.render();
          }
        } catch (err) {
          console.error("Erro ao criar RecaptchaVerifier:", err);
        }
      };
      
      const timer = setTimeout(initRecaptcha, 100);
      return () => clearTimeout(timer);
    }
  }, [visible, tab, step]);

  async function handleEmailLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const email    = e.target.email.value;
      const password = e.target.password.value;
      await login(email, password);
      onClose();
    } catch {
      setError('E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const phone = e.target.phone.value;
      confirmRef.current = await sendPhoneCode(phone);
      setStep('code');
    } catch (err) {
      console.error("Erro no envio de SMS:", err);
      if (err.code === 'auth/invalid-phone-number') {
        setError('Número inválido. Use +55 11 99999-9999.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else if (err.code === 'auth/captcha-check-failed') {
        setError('Falha na verificação do Captcha. Tente novamente.');
      } else {
        setError('Falha ao enviar código. Verifique sua conexão e o número.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await confirmRef.current.confirm(e.target.code.value);
      onClose();
    } catch {
      setError('Código inválido.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className={styles.close} onClick={onClose} aria-label="Fechar">×</button>
        <h2 id="login-title" className={styles.title}>Entrar</h2>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'email' ? styles.activeTab : ''}`} onClick={() => { setTab('email'); setError(''); }}>Email</button>
          <button className={`${styles.tab} ${tab === 'phone' ? styles.activeTab : ''}`} onClick={() => { setTab('phone'); setError(''); }}>Celular</button>
        </div>

        {tab === 'email' && (
          <form onSubmit={handleEmailLogin} className={styles.form}>
            <input name="email"    type="email"    placeholder="Seu e-mail" required className={styles.input} />
            <input name="password" type="password" placeholder="Sua senha"  required className={styles.input} />
            <button type="submit" className="btn btn--primary" disabled={loading} style={{width:'100%'}}>
              {loading ? 'Entrando…' : 'Login'}
            </button>
          </form>
        )}

        {tab === 'phone' && step === 'phone' && (
          <form onSubmit={handleSendCode} className={styles.form}>
            <p className={styles.info}>Insira seu número com código do país (ex: +55 11 987654321).</p>
            <input name="phone" type="tel" placeholder="+55 11 99999-9999" required className={styles.input} />
            <button type="submit" className="btn btn--primary" disabled={loading} style={{width:'100%'}}>
              {loading ? 'Enviando…' : 'Enviar Código'}
            </button>
            <div ref={recaptchaRef} id="recaptcha-container" />
          </form>
        )}

        {tab === 'phone' && step === 'code' && (
          <form onSubmit={handleVerifyCode} className={styles.form}>
            <p className={styles.info}>Enviamos um código de 6 dígitos para o seu celular.</p>
            <input name="code" type="text" placeholder="Código de 6 dígitos" required className={styles.input} autoComplete="one-time-code" />
            <button type="submit" className="btn btn--primary" disabled={loading} style={{width:'100%'}}>
              {loading ? 'Verificando…' : 'Verificar e Entrar'}
            </button>
          </form>
        )}

        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>
    </div>
  );
}
