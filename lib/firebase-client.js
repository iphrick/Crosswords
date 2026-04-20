// lib/firebase-client.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBR9iBjZO5tnPvp1dtTGfhm4SyjKTbYFkU",
  authDomain: "cruzadinhas-de-direito.firebaseapp.com",
  projectId: "cruzadinhas-de-direito",
  storageBucket: "cruzadinhas-de-direito.firebasestorage.app",
  messagingSenderId: "419419084637",
  appId: "1:419419084637:web:89d7bbef4a35eb1dd73ab4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
