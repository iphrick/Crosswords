// pages/api/auth/check-username.js
import { db } from '@/lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { username } = req.query;
  if (!username || username.length < 3) return res.status(400).json({ error: 'Username muito curto.' });

  const cleanUsername = username.toLowerCase().trim();

  try {
    const doc = await db.collection('usernames').doc(cleanUsername).get();
    return res.status(200).json({ available: !doc.exists() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
