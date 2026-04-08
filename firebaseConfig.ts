import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, initializeFirestore } from "firebase/firestore";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from "react-native";
import Constants from 'expo-constants'; // Import indispensable pour lire app.json
import {
  initializeAuth,
  getAuth,
  Auth,
  getReactNativePersistence,
} from 'firebase/auth';

// Configuration hybride : cherche dans process.env OU dans les extras d'app.json
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || Constants.expoConfig?.extra?.firebaseAppId,
};

// LOG DE DEBUG pour voir quelle valeur est lue sur Vercel
if (Platform.OS === 'web') {
    console.log("🔥 Firebase Config Check:", firebaseConfig.apiKey ? "CLEF OK" : "CLEF MANQUANTE");
}

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

// 4. Initialisation de Google Analytics
let analytics: Analytics | null = null;
if (Platform.OS === 'web' && typeof window !== "undefined") {
    isSupported().then(supported => {
        if (supported) {
          analytics = getAnalytics(app);
          console.log("📊 Analytics Initialisé");
        }
    });
}

export { auth, db, analytics, app };
