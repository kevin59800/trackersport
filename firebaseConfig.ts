import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, initializeFirestore } from "firebase/firestore";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from "react-native";
import {
  initializeAuth,
  getAuth,
  Auth,
  getReactNativePersistence,
} from 'firebase/auth';

// Configuration avec tes clés réelles (Fallback inclus pour Vercel)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAWMb7LbrDD3gBD3inJ2UxvRUZmKgIwLWg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sporttracker-391b5.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sporttracker-391b5",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sporttracker-391b5.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "984360239000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:984360239000:web:c0a6dc2cbb7180f1b135ed",
};

// 1. Initialisation de l'App
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialisation de l'Auth
let auth: Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

// 3. Initialisation de Firestore
const db: Firestore = Platform.OS === 'web'
    ? initializeFirestore(app, { experimentalForceLongPolling: true })
    : getFirestore(app);

// 4. Initialisation de Google Analytics (Sécurisé pour le Web)
let analytics: Analytics | null = null;
if (Platform.OS === 'web' && typeof window !== "undefined") {
    isSupported().then(supported => {
        if (supported) {
            analytics = getAnalytics(app);
            console.log("✅ Firebase Analytics est prêt");
        }
    }).catch(err => console.log("Analytics non supporté"));
}

export { auth, db, analytics, app };
