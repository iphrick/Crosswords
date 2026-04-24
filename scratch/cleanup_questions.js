const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function cleanupQuestions() {
  console.log('--- Iniciando limpeza de questões redundantes ---');
  const snap = await db.collection('questions').get();
  let count = 0;
  let deleted = 0;

  const batch = db.batch();

  snap.forEach(doc => {
    const data = doc.data();
    const question = (data.question || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    const answer = (data.answer || '').toUpperCase();

    if (question.includes(answer)) {
      console.log(`[DELETANDO] Pergunta: "${data.question}" | Resposta: "${data.answer}"`);
      batch.delete(doc.ref);
      deleted++;
    }
    count++;
  });

  if (deleted > 0) {
    await batch.commit();
    console.log(`--- Sucesso! ${deleted} questões removidas de um total de ${count}. ---`);
  } else {
    console.log('--- Nenhuma questão redundante encontrada. ---');
  }
}

cleanupQuestions().catch(console.error);
