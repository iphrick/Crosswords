// pages/api/auth/update-username.js
import { db } from '@/lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { uid, username } = req.body;
  if (!uid || !username) return res.status(400).json({ error: 'Dados incompletos.' });

  const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_ ]/g, '');
  if (cleanUsername.length < 3 || cleanUsername.length > 30) {
    return res.status(400).json({ error: 'Username deve ter entre 3 e 30 caracteres.' });
  }

  try {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const userData = userSnap.data();
    const oldUsername = userData.nickname?.toLowerCase();

    // Iniciar transação para garantir unicidade
    await db.runTransaction(async (t) => {
      const usernameRef = db.collection('usernames').doc(cleanUsername);
      const usernameSnap = await t.get(usernameRef);

      if (usernameSnap.exists && usernameSnap.data().uid !== uid) {
        throw new Error('Este nome de usuário já está sendo usado.');
      }

      // Se mudou de username, remove o antigo
      if (oldUsername && oldUsername !== cleanUsername) {
        t.delete(db.collection('usernames').doc(oldUsername));
      }

      // Reserva o novo username
      t.set(usernameRef, { uid });
      
      // Atualiza o documento do usuário
      t.update(userRef, { nickname: username });
    });

    return res.status(200).json({ success: true, username });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
