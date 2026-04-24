import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './Modal.module.css';

export default function UsernameModal({ isOpen }) {
  const { updateUsername, checkUsername } = useAuth();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState({ loading: false, available: null, message: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) {
      setStatus({ loading: false, available: null, message: '' });
      return;
    }

    const timer = setTimeout(async () => {
      if (username.length < 3) return;
      
      setStatus(prev => ({ ...prev, loading: true }));
      const data = await checkUsername(username);
      setStatus({
        loading: false,
        available: data.available,
        message: data.available ? '✔ Disponível' : (data.error || '✖ Já em uso')
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status.available) return;
    
    setError('');
    try {
      await updateUsername(username);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Identidade de Jogador</h2>
          <p>Escolha seu nome único no JuriQuest.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Nome de usuário</label>
            <input
              type="text"
              placeholder="ex: advogado_ninja"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
              minLength={3}
              maxLength={30}
            />
            {username.length > 0 && (
              <p className={`${styles.hint} ${status.available ? 'text-emerald-500' : 'text-red-500'}`}>
                {status.loading ? 'Verificando...' : status.message}
              </p>
            )}
            <p className={styles.subHint}>Apenas letras, números e underline (_). Entre 3-20 caracteres.</p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={!status.available || status.loading}
          >
            {status.loading ? 'Salvando...' : 'Confirmar Nome'}
          </button>
        </form>
      </div>
    </div>
  );
}
