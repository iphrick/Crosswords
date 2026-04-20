const admin = require('firebase-admin');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envFile.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.*)/);
if (!keyMatch) {
  console.log("No key found");
  process.exit(1);
}
let keyStr = keyMatch[1];
if (keyStr.startsWith("'") && keyStr.endsWith("'")) {
  keyStr = keyStr.slice(1, -1);
}

const serviceAccount = JSON.parse(keyStr);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function run() {
  const snap = await db.collection('questions').limit(2).get();
  snap.forEach(doc => {
    console.log(doc.data());
  });
}

run().catch(console.error);
