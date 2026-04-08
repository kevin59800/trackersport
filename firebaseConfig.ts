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
  browserLocalPersistence,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAWMb7LbrDD3gBD3inJ2UxvRUZmKgIwLWg",
  authDomain: "sporttracker-391b5.firebaseapp.com",
  projectId: "sporttracker-391b5",
  storageBucket: "sporttracker-391b5.firebasestorage.app",
  messagingSenderId: "984360239000",
  appId: "1:984360239000:web:c0a6dc2cbb7180f1b135ed",
};

// 1. Initialisation de l'App
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialisation de l'Auth (Persistance adaptée Web vs Mobile)
let auth: Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  // Pour iOS/Android, on utilise AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

// 3. Initialisation de Firestore
const db: Firestore = getFirestore(app);

// 4. Analytics
let analytics: Analytics | null = null;
if (Platform.OS === 'web' && typeof window !== "undefined") {
  isSupported().then(supported => {
    if (supported) analytics = getAnalytics(app);
  });
}

export { auth, db, analytics, app };
