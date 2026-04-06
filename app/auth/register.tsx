import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import { auth } from "../../firebaseConfig";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Ajout d'un état de chargement

  const handleSignUp = () => {
    if (email === "" || password === "") {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Utilisateur créé :", user.email);

        // ✅ On passe l'email à la page suivante via les paramètres de recherche (query params)
        router.replace({
          pathname: "/auth/setup-profile",
          params: { userEmail: user.email }
        });
      })
      .catch((error) => {
        setLoading(false);
        console.error("Erreur Firebase :", error.code);
        let message = "Une erreur est survenue.";
        if (error.code === 'auth/email-already-in-use') message = "Cet email est déjà utilisé.";
        if (error.code === 'auth/weak-password') message = "Le mot de passe est trop court.";
        Alert.alert("Erreur", message);
      });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Inscription</Text>
      <Text style={styles.subtitle}>Rejoignez la communauté SportTracker</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe (min. 6 caractères)"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>CRÉER MON COMPTE</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ... Tes styles restent identiques ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 30,
    justifyContent: "center",
  },
  backButton: { position: "absolute", top: 60, left: 20 },
  backText: { color: "#FF6600", fontSize: 16 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6600",
    marginBottom: 10,
  },
  subtitle: { color: "#fff", marginBottom: 30, opacity: 0.7 },
  inputContainer: { width: "100%", marginBottom: 20 },
  input: {
    width: "100%",
    height: 55,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    paddingHorizontal: 20,
    color: "#FFFFFF",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    width: "100%",
    height: 55,
    backgroundColor: "#FF6600",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
