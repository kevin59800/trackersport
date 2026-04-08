import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, initializeFirestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics"; // Ajout Analytics
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from "react-native";
import {
  initializeAuth,
  getAuth,
  Auth,
  getReactNativePersistence,
} from 'firebase/auth';

// Ta configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAWMb7LbrDD3gBD3inJ2UxvRUZmKgIwLWg",
  authDomain: "sporttracker-391b5.firebaseapp.com",
  projectId: "sporttracker-391b5",
  storageBucket: "sporttracker-391b5.firebasestorage.app",
  messagingSenderId: "984360239000",
  appId: "1:984360239000:web:c0a6dc2cbb7180f1b135ed",
};

// 1. Initialisation de l'App (Singleton)
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialisation de l'Auth intelligente
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

// 4. Initialisation de Google Analytics (uniquement sur le Web)
let analytics: Analytics | null = null;
if (Platform.OS === 'web' && typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

export { auth, db, analytics };
