// lib/firebase-admin.js
import admin from 'firebase-admin';

let db, auth;

const hasConfig =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (hasConfig && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } catch (err) {
    console.error('Firebase Admin init error:', err);
  }
}

if (admin.apps.length > 0) {
  db = admin.firestore();
  auth = admin.auth();
} else if (process.env.NODE_ENV === 'production') {
  console.error('Firebase Admin not configured. Check FIREBASE_* env vars.');
}

export { db, auth };
