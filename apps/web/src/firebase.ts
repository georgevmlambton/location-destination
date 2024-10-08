import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = JSON.parse(atob(import.meta.env.VITE_FIREBASE_CONFIG));

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
