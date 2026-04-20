// components/auth/RegisterModal.jsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './Modal.module.css';

export default function RegisterModal({ visible, onClose }) {
  const { register } = useAuth();
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  if (!visible) return null;

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(e.target.email.value, e.target.password.value);
      onClose();
    } catch (err) {
      if (err.code === 'auth/weak-password')        setError('A senha deve ter pelo menos 6 caracteres.');
      else if (err.code === 'auth/email-already-in-use') setError('Este e-mail já está em uso.');
      else setError('Ocorreu um erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="register-title">
        <button className={styles.close} onClick={onClose} aria-label="Fechar">×</button>
        <h2 id="register-title" className={styles.title}>Criar Conta</h2>

        <form onSubmit={handleRegister} className={styles.form}>
          <input name="email"    type="email"    placeholder="Seu e-mail"                      required className={styles.input} />
          <input name="password" type="password" placeholder="Crie uma senha (mín. 6 caracteres)" required className={styles.input} minLength={6} />
          <button type="submit" className="btn btn--primary" disabled={loading} style={{width:'100%'}}>
            {loading ? 'Cadastrando…' : 'Cadastrar'}
          </button>
        </form>

        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>
    </div>
  );
}
