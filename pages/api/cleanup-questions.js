// pages/api/cleanup-questions.js
import { db } from '@/lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  const { secret } = req.body;
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  if (!db) return res.status(500).json({ error: 'Database not initialized.' });

  try {
    const snap = await db.collection('questions').get();
    let deleted = 0;
    const batch = db.batch();

    snap.forEach(doc => {
      const data = doc.data();
      const question = (data.question || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      const answer = (data.answer || '').toUpperCase();

      if (question.includes(answer)) {
        batch.delete(doc.ref);
        deleted++;
      }
    });

    if (deleted > 0) {
      await batch.commit();
    }

    return res.status(200).json({ message: `Limpeza concluída. ${deleted} questões redundantes removidas.` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
