import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { router } from 'expo-router';

// Indispensable pour fermer la fenêtre après connexion (surtout sur le Web)
WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  // Configuration des IDs Clients Google
  const [request, response, promptAsync] = Google.useAuthRequest({
    // ID du "Client Web 2" (pour Vercel et Localhost)
    webClientId: '984360239000-ku04n5o8ao4r4j6ma4liqt5utvh45j2o.apps.googleusercontent.com',

    // ID du "SportTracker Expo Proxy" (pour Expo Go sur iOS)
    iosClientId: '984360239000-doss9eb1eqe5ke5vdqgv90aiie2ikmgr.apps.googleusercontent.com',

    // ID du "SportTracker Expo Proxy" (pour Expo Go sur Android)
    androidClientId: '984360239000-doss9eb1eqe5ke5vdqgv90aiie2ikmgr.apps.googleusercontent.com',
  });

  // Écouteur de réponse Google
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then(() => {
          console.log("Connexion Google réussie !");
          // Redirection vers l'onglet principal (tabs)
          router.replace('/(tabs)');
        })
        .catch((error) => {
          console.error("Erreur Firebase :", error);
          Alert.alert("Erreur de connexion", error.message);
        });
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SportTracker</Text>
      <Text style={styles.subtitle}>Créez votre compte pour commencer</Text>

      {/* Bouton Google */}
      <TouchableOpacity
        style={[styles.googleButton, !request && { opacity: 0.6 }]}
        disabled={!request}
        onPress={() => {
          promptAsync();
        }}
      >
        <Text style={styles.buttonText}>Continuer avec Google</Text>
      </TouchableOpacity>

      {/* Lien vers la connexion classique */}
      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => router.push('/auth/login')}
      >
        <Text style={styles.linkText}>Déjà un compte ? <Text style={styles.linkHighlight}>Se connecter</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Fond noir profond
    padding: 24,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 40,
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkContainer: {
    marginTop: 24,
  },
  linkText: {
    color: '#888',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#fff',
    fontWeight: '600',
  }
});
