import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { auth } from "../../firebaseConfig"; // Vérifie que le chemin vers ton firebaseConfig est correct
import { signInWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";

// L'erreur venait du fait qu'il manquait "export default" devant la fonction
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Merci de remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Si ça réussit, on va vers le profil
      router.replace("/(tabs)/profile");
    } catch (error: any) {
      console.error(error);
      let message = "Une erreur est survenue.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Email ou mot de passe incorrect.";
      }
      Alert.alert("Échec de connexion", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Bon retour ! 👋</Text>
        <Text style={styles.subtitle}>Connecte-toi pour suivre tes performances.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="ton@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "CONNEXION..." : "SE CONNECTER"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <Text style={styles.linkText}>Pas encore de compte ? <Text style={{fontWeight: 'bold', color: '#FF4500'}}>S'inscrire</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  inner: { flex: 1, padding: 30, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2D3436', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#636E72', marginBottom: 30 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#2D3436', marginBottom: 8 },
  input: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    fontSize: 16
  },
  button: {
    backgroundColor: "#FF4500",
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#FF4500",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5
  },
  buttonText: { color: "#FFF", fontWeight: 'bold', fontSize: 16 },
  linkText: { textAlign: 'center', marginTop: 25, color: '#636E72', fontSize: 14 }
});
