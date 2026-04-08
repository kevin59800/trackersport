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

// REMPLACE LES VALEURS CI-DESSOUS PAR CELLES DE TON FICHIER .env.local
const firebaseConfig = {
  apiKey: "TON_API_KEY_ICI",
  authDomain: "TON_PROJECT_ID.firebaseapp.com",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "TON_SENDER_ID",
  appId: "TON_APP_ID"
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

// 4. Initialisation de Analytics
let analytics: Analytics | null = null;
if (Platform.OS === 'web' && typeof window !== "undefined") {
    isSupported().then(supported => {
        if (supported) analytics = getAnalytics(app);
    });
}

export { auth, db, analytics, app };
