import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "integrated-wharf-pf6jr",
  appId: "1:613043222846:web:e38cf882fddcbbe74bd46f",
  apiKey: "AIzaSyAymTIeAbbtdD5JdbzkpwMZZHPi05YIlGU",
  authDomain: "integrated-wharf-pf6jr.firebaseapp.com",
  storageBucket: "integrated-wharf-pf6jr.firebasestorage.app",
  messagingSenderId: "613043222846",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, "ai-studio-d029b257-1f5d-49f4-95e7-75d1d4b1e38d");
