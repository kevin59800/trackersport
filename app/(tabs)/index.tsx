import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import pour l'icône de déconnexion

// Imports Firebase
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

const WORKOUT_DATA = [
  {
    "title": "Machines Guidées (Matrix)",
    "data": [
      { "id": "1", "name": "Chest Press", "target": "Pectoraux", "exercises": ["Prise Neutre", "Prise Large"] },
      { "id": "2", "name": "Pec Deck", "target": "Pectoraux", "exercises": ["Pectoraux (Écarté)", "Deltoïde Arrière"] },
      { "id": "3", "name": "Shoulder Press", "target": "Épaules", "exercises": ["Développé Militaire"] },
      { "id": "4", "name": "Lateral Raise", "target": "Épaules", "exercises": ["Élévations Latérales"] },
      { "id": "5", "name": "Lat Pulldown", "target": "Dos", "exercises": ["Tirage Poitrine", "Tirage Nuque", "Prise Serrée"] },
      { "id": "6", "name": "Seated Row", "target": "Dos", "exercises": ["Tirage Horizontal", "Tirage Unilatéral"] },
      { "id": "7", "name": "Back Extension", "target": "Dos", "exercises": ["Lombaires"] },
      { "id": "8", "name": "Triceps Press", "target": "Triceps", "exercises": ["Dips assis"] },
      { "id": "9", "name": "Biceps Curl", "target": "Biceps", "exercises": ["Curl Machine"] },
      { "id": "10", "name": "Leg Press", "target": "Jambes", "exercises": ["Presse à cuisses", "Mollets à la presse"] },
      { "id": "11", "name": "Leg Extension", "target": "Jambes", "exercises": ["Quadriceps"] },
      { "id": "12", "name": "Seated Leg Curl", "target": "Jambes", "exercises": ["Ischios-jambiers"] },
      { "id": "13", "name": "Abdominal Crunch", "target": "Abdominaux", "exercises": ["Crunch Machine"] },
      { "id": "14", "name": "Adducteur / Abducteur", "target": "Fessiers", "exercises": ["Adducteurs", "Abducteurs"] },
      { "id": "15", "name": "Glute Kickback", "target": "Fessiers", "exercises": ["Fessiers Arrière"] }
    ]
  },
  {
    "title": "Poids Libres & Câbles",
    "data": [
      { "id": "16", "name": "Poulie Vis-à-vis", "target": "Polyarticulaire", "exercises": ["Écartés hauts", "Écartés bas", "Triceps Corde", "Biceps Corde", "Tirage visage"] },
      { "id": "17", "name": "Smith Machine", "target": "Polyarticulaire", "exercises": ["Squat guidé", "Développé couché guidé", "Développé militaire"] },
      { "id": "18", "name": "Haltères", "target": "Libre", "exercises": ["Développé couché", "Curl incliné", "Élévations latérales", "Rowing haltère"] },
      { "id": "19", "name": "Barre Olympique", "target": "Libre", "exercises": ["Squat", "Soulevé de terre", "Développé couché", "Rowing barre"] }
    ]
  },
  {
    "title": "Espace Cardio",
    "data": [
      { "id": "20", "name": "Tapis de Course", "target": "Cardio", "exercises": ["Marche inclinée", "Course à pied", "Fractionné"] },
      { "id": "21", "name": "Vélo Elliptique", "target": "Cardio", "exercises": ["Endurance", "Résistance"] },
      { "id": "22", "name": "Stairmaster", "target": "Cardio", "exercises": ["Montée de marches", "Intervalle"] },
      { "id": "23", "name": "Rameur", "target": "Cardio", "exercises": ["Endurance", "Puissance"] }
    ]
  }
];

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) setUserData(docSnap.data());
        } catch (error) {
          console.error("Erreur profil:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de se déconnecter.");
    }
  };

  const closeModal = () => {
    setSelectedMachine(null);
    setSelectedExercise("");
    setSets(""); setReps(""); setWeight("");
    setSaving(false);
  };

  const handleSaveWorkout = async () => {
    if (!selectedExercise || !sets || !reps || !weight) {
      alert("Veuillez remplir tous les champs ! 💪");
      return;
    }
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      const userWorkoutsRef = collection(db, "users", user.uid, "myWorkouts");
      await addDoc(userWorkoutsRef, {
        machineName: selectedMachine.name,
        exercise: selectedExercise,
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight),
        timestamp: serverTimestamp(),
      });
      alert("Séance enregistrée ! 🔥");
      closeModal();
    } catch (e: any) {
      alert("Erreur : " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6600" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* HEADER AVEC BOUTON DÉCONNEXION */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.userName}>{userData?.firstName} {userData?.lastName}</Text>
            <Text style={styles.userStats}>
              {userData?.weight}kg • {userData?.height}cm • {userData?.age}ans
            </Text>
          </View>

          {/* BOUTON EN HAUT À DROITE */}
          <TouchableOpacity style={styles.logoutIconButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {WORKOUT_DATA.map((section, idx) => (
            <View key={idx} style={styles.sectionWrapper}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.data.map((machine) => (
                <TouchableOpacity
                  key={machine.id}
                  style={styles.machineCard}
                  onPress={() => setSelectedMachine(machine)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.machineName}>{machine.name}</Text>
                    <Text style={styles.machineTarget}>{machine.target}</Text>
                  </View>
                  <View style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* MODALE DE SAISIE */}
      <Modal visible={selectedMachine !== null} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>{selectedMachine?.name}</Text>
            <Text style={styles.label}>Exercice :</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exerciseList}>
              {selectedMachine?.exercises.map((ex: string) => (
                <TouchableOpacity
                  key={ex}
                  style={[styles.chip, selectedExercise === ex && styles.chipActive]}
                  onPress={() => setSelectedExercise(ex)}
                >
                  <Text style={selectedExercise === ex ? styles.chipTextActive : styles.chipText}>{ex}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.inputRow}>
              <View style={styles.inputBox}>
                <Text style={styles.label}>Séries</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={sets} onChangeText={setSets} placeholder="0" placeholderTextColor="#444" />
              </View>
              <View style={styles.inputBox}>
                <Text style={styles.label}>Reps</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={reps} onChangeText={setReps} placeholder="0" placeholderTextColor="#444" />
              </View>
              <View style={styles.inputBox}>
                <Text style={styles.label}>Poids</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} placeholder="0" placeholderTextColor="#444" />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveWorkout} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>VALIDER LA SÉANCE</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  header: {
    backgroundColor: "#FF6600",
    padding: 25,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomRightRadius: 35,
    borderBottomLeftRadius: 35,
    position: 'relative' // Important pour placer le bouton logout
  },
  logoutIconButton: {
    position: 'absolute',
    right: 25,
    top: 60,
    padding: 5
  },
  avatar: { width: 65, height: 65, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 22 },
  infoContainer: { marginLeft: 15 },
  userName: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  userStats: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 2 },
  body: { padding: 20 },
  sectionWrapper: { marginBottom: 30 },
  sectionTitle: { color: '#FF6600', fontSize: 16, fontWeight: '900', marginBottom: 15, letterSpacing: 1 },
  machineCard: { backgroundColor: '#1E1E1E', padding: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  machineName: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  machineTarget: { color: '#777', fontSize: 12, marginTop: 3, fontWeight: '600' },
  addButton: { backgroundColor: '#2A2A2A', width: 35, height: 35, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#FF6600', fontSize: 20, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  modalHeader: { color: '#FF6600', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 25 },
  label: { color: '#FFF', fontSize: 14, marginBottom: 10, fontWeight: 'bold' },
  exerciseList: { flexDirection: 'row', marginBottom: 25 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#333', marginRight: 10, backgroundColor: '#222' },
  chipActive: { backgroundColor: '#FF6600', borderColor: '#FF6600' },
  chipText: { color: '#777', fontWeight: '600' },
  chipTextActive: { color: '#FFF', fontWeight: 'bold' },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  inputBox: { width: '30%' },
  input: { backgroundColor: '#252525', borderRadius: 12, padding: 15, color: '#FFF', textAlign: 'center', fontSize: 20, fontWeight: 'bold', borderWidth: 1, borderColor: '#333' },
  saveBtn: { backgroundColor: '#FF6600', padding: 20, borderRadius: 18, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  closeBtn: { marginTop: 20, alignItems: 'center' },
  closeBtnText: { color: '#555', fontWeight: 'bold' }
});
