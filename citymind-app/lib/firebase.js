import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

let rawBucket = (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "citymind-ai.appspot.com")
  .replace(/^gs:\/\//, '')
  .trim();

// Automatically correct misconfigured .firebasestorage.app domain to standard .appspot.com
if (rawBucket.endsWith('.firebasestorage.app')) {
  rawBucket = rawBucket.replace(/\.firebasestorage\.app$/, '.appspot.com');
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDemoKeyForCityMindApp12345",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "citymind-ai.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "citymind-ai",
  storageBucket: rawBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
};

// Check if real Firebase API key has been configured by the user
export const isFirebaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) &&
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('your_firebase_api_key');

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

