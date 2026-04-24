// pages/api/auth/check-username.js
import { db } from '@/lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { username, uid } = req.query;
  if (!username || username.length < 3) return res.status(400).json({ error: 'Username muito curto.' });

  // Normalização idêntica ao update-username
  const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

  try {
    const usernameRef = db.collection('usernames').doc(cleanUsername);
    const doc = await usernameRef.get();
    
    if (doc.exists()) {
      const data = doc.data();
      const ownerUid = data.uid;

      // Caso 1: É o próprio usuário checando seu nome já registrado
      if (uid && ownerUid === uid) {
        return res.status(200).json({ available: true, isOwner: true });
      }

      // Caso 2: O registro existe, mas o usuário dono pode ter sido deletado
      const ownerSnap = await db.collection('users').doc(ownerUid).get();
      if (!ownerSnap.exists) {
        await usernameRef.delete(); // Limpa registro fantasma
        return res.status(200).json({ available: true });
      }

      // Caso 3: Nome realmente ocupado por outro usuário ativo
      return res.status(200).json({ available: false });
    }

    // Caso 4: Registro não existe no index, mas vamos conferir no documento do usuário (Double Check)
    const userWithNick = await db.collection('users')
      .where('nickname', '==', username) // Busca pelo nome original (ou normalizado)
      .limit(1)
      .get();
    
    if (!userWithNick.empty) {
      const otherUid = userWithNick.docs[0].id;
      if (uid && otherUid === uid) {
        return res.status(200).json({ available: true });
      }
      return res.status(200).json({ available: false });
    }

    return res.status(200).json({ available: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
