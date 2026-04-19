const admin = require('firebase-admin');

let db, auth;

// Verifica se as credenciais do servidor estão presentes nas variáveis de ambiente.
const hasFirebaseAdminConfig =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

// Inicializa o app do Firebase Admin somente se não tiver sido inicializado antes
// e se as credenciais existirem. Isso previne erros em ambientes serverless.
if (hasFirebaseAdminConfig && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Falha na inicialização do Firebase Admin SDK:', error);
  }
}

// Acessa os serviços do Firebase somente se o app foi inicializado
if (admin.apps.length > 0) {
  db = admin.firestore();
  auth = admin.auth();
} else {
  // Loga um erro claro se as credenciais estiverem faltando em produção
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
      console.error('Credenciais do Firebase Admin não configuradas corretamente nas variáveis de ambiente. As funções de API não conseguirão acessar o banco de dados.');
  }
}

module.exports = { db, auth };