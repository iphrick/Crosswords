// components/auth/RegisterModal.jsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './Modal.module.css';

export default function RegisterModal({ visible, onClose }) {
  const { register, updateUsername, checkUsername } = useAuth();
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState({ checking: false, available: null, msg: '' });

  if (!visible) return null;

  async function handleUsernameChange(val) {
    const clean = val.toLowerCase().replace(/[^a-z0-9_ ]/g, '');
    setUsername(clean);
    if (clean.length < 3) {
      setStatus({ checking: false, available: null, msg: '' });
      return;
    }
    setStatus(s => ({ ...s, checking: true }));
    const isAvail = await checkUsername(clean);
    setStatus({ checking: false, available: isAvail, msg: isAvail ? '✔ Disponível' : '✖ Já em uso' });
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (status.available === false) return;
    setError('');
    setLoading(true);
    try {
      await register(e.target.email.value, e.target.password.value);
      // O username será salvo via AuthContext useEffect ou explicitamente aqui
      await updateUsername(username);
      onClose();
    } catch (err) {
      if (err.code === 'auth/weak-password')        setError('A senha deve ter pelo menos 6 caracteres.');
      else if (err.code === 'auth/email-already-in-use') setError('Este e-mail já está em uso.');
      else setError(err.message || 'Ocorreu um erro ao cadastrar.');
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
          <div className="mb-4">
            <input 
              name="username" 
              type="text" 
              placeholder="Nome de usuário (único)" 
              required 
              className={styles.input} 
              value={username}
              onChange={e => handleUsernameChange(e.target.value)}
              minLength={3}
              maxLength={20}
            />
            {username.length >= 3 && (
              <p className={`text-[10px] mt-1 font-bold ${status.available ? 'text-emerald-500' : 'text-red-500'}`}>
                {status.checking ? 'Verificando...' : status.msg}
              </p>
            )}
          </div>
          <input name="email"    type="email"    placeholder="Seu e-mail"                      required className={styles.input} />
          <input name="password" type="password" placeholder="Crie uma senha (mín. 6 caracteres)" required className={styles.input} minLength={6} />
          <button type="submit" className="btn btn--primary" disabled={loading || status.available === false} style={{width:'100%'}}>
            {loading ? 'Cadastrando…' : 'Cadastrar'}
          </button>
        </form>

        {error && <p className={styles.error} role="alert" style={{marginTop: '1rem'}}>{error}</p>}
      </div>
    </div>
  );
}
