// pages/api/get-questions.js
import { db } from '@/lib/firebase-admin';

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!db) return res.status(500).json({ error: 'Firestore não inicializado.' });

  const { subject = 'Direito Geral', level = 1, previous_words = [] } = req.body;
  const parsedLevel = parseInt(level, 10);
  if (isNaN(parsedLevel) || parsedLevel < 1)
    return res.status(400).json({ error: 'Nível inválido.' });

  const num = Math.min(5 + (parsedLevel - 1), 10);

  try {
    const snap = await db.collection('questions')
      .where('subject', '==', subject)
      .where('level', '==', parsedLevel)
      .get();

    if (snap.empty)
      return res.status(404).json({ error: `Nenhuma pergunta encontrada para '${subject}' nível ${parsedLevel}.` });

    let all = [];
    snap.forEach(d => all.push(d.data()));

    const available = all.filter(q => !previous_words.includes(q.answer));
    const selected  = shuffleArray(available).slice(0, num);

    if (selected.length === 0)
      return res.status(404).json({ error: 'Sem perguntas novas. Resete o progresso.' });

    return res.status(200).json({ crossword: selected });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
