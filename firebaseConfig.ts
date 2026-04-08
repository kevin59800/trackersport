import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, initializeFirestore } from "firebase/firestore";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics"; // Ajout de isSupported
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from "react-native";
import {
  initializeAuth,
  getAuth,
  Auth,
  getReactNativePersistence,
} from 'firebase/auth';

// Configuration avec une sécurité pour vérifier si les variables sont chargées
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// LOG DE DEBUG (À supprimer après vérification)
// Cela te permettra de voir dans la console si tes clés sont bien présentes
if (Platform.OS === 'web') {
    console.log("Firebase API Key check:", firebaseConfig.apiKey ? "PRÉSENTE" : "MANQUANTE");
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

// 4. Initialisation de Google Analytics (Version Robuste)
let analytics: Analytics | null = null;
if (Platform.OS === 'web' && typeof window !== "undefined") {
    // isSupported() est la méthode officielle pour éviter les crashs sur le web
    isSupported().then(supported => {
        if (supported) analytics = getAnalytics(app);
    });
}

export { auth, db, analytics, app };
