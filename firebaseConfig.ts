import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, initializeFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from "react-native";
import {
  initializeAuth,
  getAuth,
  Auth,
  getReactNativePersistence,
  browserLocalPersistence
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
  // Configuration spécifique pour Vercel / Navigateur
  auth = getAuth(app);
  // Sur le Web, Firebase gère la persistence automatiquement
  // ou via browserLocalPersistence si nécessaire.
} else {
  // Configuration spécifique pour iOS / Android (Expo Go)
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

// 3. Initialisation de Firestore avec le "Long Polling" pour le Web
// Cela évite les erreurs de connexion persistantes sur certains navigateurs
const db: Firestore = Platform.OS === 'web'
    ? initializeFirestore(app, { experimentalForceLongPolling: true })
    : getFirestore(app);

export { auth, db };
