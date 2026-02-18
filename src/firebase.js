import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const SIGNUPS_KEY = 'elitecore-cup-signups-v3';

export async function loadSignups() {
  const snapshot = await get(ref(db, SIGNUPS_KEY));
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return { thursday: [], sunday: [] };
}

export async function saveSignups(signups) {
  await set(ref(db, SIGNUPS_KEY), signups);
}
