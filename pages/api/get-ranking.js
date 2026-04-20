// pages/api/get-ranking.js
import { db } from '@/lib/firebase-admin';

function sanitizePlayerName(identifier, nickname) {
  if (nickname?.trim()) return nickname.trim().substring(0, 15);
  if (!identifier) return 'Anônimo';
  const base = identifier.includes('@') ? identifier.split('@')[0] : identifier;
  const clean = base.replace(/[^a-zA-Z0-9]/g, '');
  return clean.length > 0 ? clean : 'Jogador';
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!db) return res.status(500).json({ error: 'Firestore não inicializado.' });

  try {
    const snap = await db.collection('users').get();
    if (snap.empty) return res.status(200).json({ ranking: [] });

    const players = [];
    snap.forEach(d => {
      const data     = d.data();
      const subjects = data.subjects || {};
      let totalScore = 0, highestLevel = 1;
      for (const key in subjects) {
        totalScore += subjects[key].score || 0;
        if ((subjects[key].level || 1) > highestLevel) highestLevel = subjects[key].level;
      }
      if (totalScore > 0) {
        players.push({
          name: sanitizePlayerName(data.email || data.phoneNumber, data.nickname),
          totalScore,
          highestLevel,
          avatarUrl: data.avatarUrl || null,
          profession: data.profession || null,
        });
      }
    });

    players.sort((a, b) => b.totalScore - a.totalScore);
    return res.status(200).json({ ranking: players.slice(0, 50) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
