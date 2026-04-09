import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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
  Image,
  ActivityIndicator
} from "react-native";
import { auth, db } from "../../firebaseConfig";

export default function SetupProfile() {
  const router = useRouter();
  const { name, photo, userEmail } = useLocalSearchParams();

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
          profileCompleted: true, // Marqueur crucial pour l'aiguilleur
          updatedAt: serverTimestamp(),
        }, { merge: true });

        // On renvoie à la racine pour que l'index valide l'accès au profil
        router.replace("/");
      } else {
        Alert.alert("Erreur", "Vous n'êtes pas connecté.");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      {photo && (
        <Image source={{ uri: photo as string }} style={styles.profileImage} />
      )}

      <Text style={styles.title}>Finalisons ton profil 🏃‍♂️</Text>
      <Text style={styles.subtitle}>Ces infos nous aident à personnaliser tes entraînements.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>IDENTITÉ</Text>
        <TextInput
          style={styles.input}
          placeholder="Prénom"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="#444"
        />
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor="#444"
        />

        <View style={styles.rowInputs}>
            <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>ÂGE</Text>
                <TextInput
                    style={styles.input}
                    placeholder="25"
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                    placeholderTextColor="#444"
                />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.label}>POIDS (KG)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="75"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                    placeholderTextColor="#444"
                />
            </View>
        </View>

        <Text style={styles.label}>TAILLE (CM)</Text>
        <TextInput
          style={styles.input}
          placeholder="180"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
          placeholderTextColor="#444"
        />

        <Text style={styles.label}>SEXE</Text>
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

        <Text style={styles.label}>OBJECTIF PRINCIPAL</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Prise de masse"
          value={goal}
          onChangeText={setGoal}
          placeholderTextColor="#444"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSaveProfile}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>C'EST PARTI !</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 30, backgroundColor: "#121212", flexGrow: 1, paddingTop: 60 },
  profileImage: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginBottom: 10, borderWidth: 2, borderColor: '#FF6600' },
  title: { fontSize: 24, fontWeight: "bold", color: "#FFF", textAlign: "center" },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 30, fontSize: 14, marginTop: 5 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#FF6600', fontSize: 10, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: "#1A1A1A", padding: 15, borderRadius: 12, marginBottom: 15, color: '#FFF', borderWidth: 1, borderColor: '#333' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  row: { flexDirection: "row", marginBottom: 20 },
  chip: { paddingVertical: 10, paddingHorizontal: 25, borderWidth: 1, borderColor: "#333", borderRadius: 12, marginRight: 10, backgroundColor: '#1A1A1A' },
  chipActive: { backgroundColor: "#FF6600", borderColor: "#FF6600" },
  chipText: { color: "#666", fontWeight: 'bold' },
  chipTextActive: { color: "#000", fontWeight: "bold" },
  button: { backgroundColor: "#FFF", padding: 18, borderRadius: 15, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#000", fontWeight: "bold", fontSize: 16 },
});
