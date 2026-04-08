import { router, useLocalSearchParams } from "expo-router";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { auth, db } from "../../firebaseConfig";

export default function SetupProfile() {
  // 1. On récupère les paramètres envoyés par RegisterScreen (Google)
  const { name, photo, userEmail } = useLocalSearchParams();

  // 2. Initialisation intelligente des champs
  // Si 'name' existe (via Google), on essaie de séparer le prénom du nom
  const initialFirstName = typeof name === 'string' ? name.split(' ')[0] : "";
  const initialLastName = typeof name === 'string' ? name.split(' ').slice(1).join(' ') : "";

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!firstName || !lastName || !age || !weight || !height) {
      const msg = "Merci de remplir toutes les informations.";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Champs manquants", msg);
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (user) {
        // On met à jour le document existant (créé lors du Register)
        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
          email: user.email || userEmail,
          age: parseInt(age) || 0,
          weight: parseFloat(weight) || 0,
          height: parseFloat(height) || 0,
          gender,
          goal,
          photoURL: photo || user.photoURL || "",
          profileCompleted: true, // IMPORTANT : On marque le profil comme fini
          updatedAt: serverTimestamp(),
        }, { merge: true });

        if (Platform.OS === "web") {
          alert("✅ Profil créé !");
        }
        router.replace("/(tabs)"); // On envoie vers l'accueil de l'app
      } else {
        alert("❌ Erreur : Vous n'êtes pas connecté.");
      }
    } catch (error: any) {
      console.error(error);
      alert("🔥 ERREUR : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Affichage de la photo Google si elle existe */}
      {photo && (
        <Image source={{ uri: photo as string }} style={styles.profileImage} />
      )}

      <Text style={styles.title}>Finalisons ton profil 🏃‍♂️</Text>
      <Text style={styles.subtitle}>Ces infos nous aident à personnaliser tes entraînements.</Text>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Prénom"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Âge"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Poids (kg)"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Taille (cm)"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Sexe :</Text>
        <View style={styles.row}>
          {["Homme", "Femme"].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, gender === s && styles.chipActive]}
              onPress={() => setGender(s)}>
              <Text style={gender === s ? styles.chipTextActive : styles.chipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Objectif principal :</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Perdre du poids, Prise de masse..."
          value={goal}
          onChangeText={setGoal}
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSaveProfile}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "CHARGEMENT..." : "C'EST PARTI !"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 30, backgroundColor: "#fff", flexGrow: 1 },
  profileImage: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#FF4500", textAlign: "center", marginTop: 10 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 20, fontSize: 14 },
  inputGroup: { marginBottom: 20 },
  input: { backgroundColor: "#F5F5F5", padding: 15, borderRadius: 12, marginBottom: 15, color: '#000' },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: '#333' },
  row: { flexDirection: "row", marginBottom: 20 },
  chip: { paddingVertical: 10, paddingHorizontal: 20, borderWidth: 1, borderColor: "#DDD", borderRadius: 20, marginRight: 10 },
  chipActive: { backgroundColor: "#FF4500", borderColor: "#FF4500" },
  chipText: { color: "#333" },
  chipTextActive: { color: "#fff", fontWeight: "bold" },
  button: { backgroundColor: "#FF4500", padding: 18, borderRadius: 15, alignItems: "center", marginTop: 10, shadowColor: "#FF4500", shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});
