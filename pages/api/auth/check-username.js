// pages/api/auth/check-username.js
import { db } from '@/lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { username, uid } = req.query;
  if (!username || username.length < 3) return res.status(400).json({ error: 'Username muito curto.' });
  if (username.length > 30) return res.status(400).json({ error: 'Username muito longo (máx 30).' });

  // Normalização: permite letras, números, underscore e ESPAÇO
  const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_ ]/g, '');

  try {
    const usernameRef = db.collection('usernames').doc(cleanUsername);
    const doc = await usernameRef.get();
    
    if (doc.exists) { // Corrigido: .exists é uma propriedade no Admin SDK
      const data = doc.data();
      const ownerUid = data.uid;

      if (uid && ownerUid === uid) {
        return res.status(200).json({ available: true, isOwner: true });
      }

      const ownerSnap = await db.collection('users').doc(ownerUid).get();
      if (!ownerSnap.exists) { // Corrigido: .exists é uma propriedade no Admin SDK
        await usernameRef.delete();
        return res.status(200).json({ available: true });
      }

      return res.status(200).json({ available: false });
    }

    const userWithNick = await db.collection('users')
      .where('nickname', '==', username)
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
