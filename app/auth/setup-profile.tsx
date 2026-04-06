import { router, useLocalSearchParams } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";

export default function SetupProfile() {
  const { userEmail } = useLocalSearchParams();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          email: userEmail || user.email,
          age: parseInt(age) || 0,
          weight: parseFloat(weight) || 0,
          height: parseFloat(height) || 0,
          gender,
          goal,
          updatedAt: new Date().toISOString(),
        });

        alert("✅ Profil créé !");
        router.replace("/(tabs)/profile");
      } else {
        alert("❌ Erreur : Non connecté.");
      }
    } catch (error: any) {
      alert("🔥 ERREUR : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Finalisons ton profil 🏃‍♂️</Text>

      <View style={styles.inputGroup}>
        <TextInput style={styles.input} placeholder="Prénom" value={firstName} onChangeText={setFirstName} />
        <TextInput style={styles.input} placeholder="Nom" value={lastName} onChangeText={setLastName} />
        <TextInput style={styles.input} placeholder="Âge" keyboardType="numeric" value={age} onChangeText={setAge} />
        <TextInput style={styles.input} placeholder="Poids (kg)" keyboardType="numeric" value={weight} onChangeText={setWeight} />
        <TextInput style={styles.input} placeholder="Taille (cm)" keyboardType="numeric" value={height} onChangeText={setHeight} />

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
        <TextInput style={styles.input} placeholder="Objectif..." value={goal} onChangeText={setGoal} />
      </View>

      <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleSaveProfile} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "CHARGEMENT..." : "C'EST PARTI !"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 30, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", color: "#FF4500", textAlign: "center", marginVertical: 20 },
  inputGroup: { marginBottom: 20 },
  input: { backgroundColor: "#F5F5F5", padding: 15, borderRadius: 10, marginBottom: 15 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  row: { flexDirection: "row", marginBottom: 20 },
  chip: { padding: 10, borderWidth: 1, borderColor: "#DDD", borderRadius: 20, marginRight: 10 },
  chipActive: { backgroundColor: "#FF4500", borderColor: "#FF4500" },
  chipText: { color: "#333" },
  chipTextActive: { color: "#fff", fontWeight: "bold" },
  button: { backgroundColor: "#FF4500", padding: 18, borderRadius: 15, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
}); // <-- L'oubli venait souvent d'ici !
