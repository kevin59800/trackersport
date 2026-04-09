import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // On écoute l'état de connexion Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 1. L'utilisateur est connecté, on vérifie s'il a un profil dans Firestore
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            // PROFIL EXISTANT -> On l'envoie direct sur l'écran profile
            router.replace('/(tabs)/profile');
          } else {
            // PAS DE PROFIL -> On l'envoie remplir ses infos (Poids, Âge...)
            router.replace('/auth/setup-profile');
          }
        } catch (error) {
          console.error("Erreur de redirection index:", error);
        }
      } else {
        // 2. L'utilisateur n'est PAS connecté -> Direction la page de connexion
        router.replace('/auth/login');
      }
    });

    return () => unsubscribe();
  }, []);

  // Pendant que Firebase vérifie l'identité, on affiche un écran noir avec un chargement
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF6600" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
