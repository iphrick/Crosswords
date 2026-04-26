// components/auth/LoginModal.jsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './Modal.module.css';

export default function LoginModal({ visible, onClose }) {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!visible) return null;



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



  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className={styles.close} onClick={onClose} aria-label="Fechar">×</button>
        <h2 id="login-title" className={styles.title}>Entrar</h2>



        <form onSubmit={handleEmailLogin} className={styles.form}>
          <input name="email"    type="email"    placeholder="Seu e-mail" required className={styles.input} />
          <input name="password" type="password" placeholder="Sua senha"  required className={styles.input} />
          <button type="submit" className="btn btn--primary" disabled={loading} style={{width:'100%'}}>
            {loading ? 'Entrando…' : 'Login'}
          </button>
        </form>

        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>
    </div>
  );
}
