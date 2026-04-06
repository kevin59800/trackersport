import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, initializeFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from "react-native"; // Important pour détecter le Web
import {
  initializeAuth,
  getAuth,
  Auth,
  getReactNativePersistence,
  browserLocalPersistence // Persistence pour le Web
} from 'firebase/auth';

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

// 2. Initialisation de l'Auth intelligente (Web vs Mobile)
let auth: Auth;

if (getApps().length > 0) {
    auth = getAuth(app);
} else {
    // On choisit la persistence selon la plateforme
    const persistence = Platform.OS === 'web'
        ? browserLocalPersistence
        : getReactNativePersistence(ReactNativeAsyncStorage);

    auth = initializeAuth(app, { persistence });
}

// 3. Initialisation de Firestore avec le "Long Polling" pour le Web
// Cela règle le problème du "Scenario B" où l'envoi reste bloqué
const db: Firestore = Platform.OS === 'web'
    ? initializeFirestore(app, { experimentalForceLongPolling: true })
    : getFirestore(app);

export { auth, db };
