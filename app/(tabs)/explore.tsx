import React, { useState } from 'react';
import { StyleSheet, Text, View, SectionList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { db, auth } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { IconSymbol } from '@/components/ui/icon-symbol';

// On importe ton JSON (tu peux aussi le coller directement dans le fichier)
const MACHINES_DATA = [
  {
    title: "Machines Guidées (Matrix)",
    data: [
      { id: "1", name: "Chest Press", target: "Pectoraux", exercises: ["Prise Neutre", "Prise Large"] },
      { id: "2", name: "Pec Deck", target: "Pectoraux", exercises: ["Pectoraux (Écarté)", "Deltoïde Arrière"] },
      // ... ajoute le reste de tes machines ici
    ]
  },
  // ... autres sections
];

export default function ExploreScreen() {
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  // Fonction pour enregistrer la séance
  const handleSaveWorkout = async () => {
    if (!selectedExercise || !sets || !reps || !weight) {
      Alert.alert("Erreur", "Remplit tous les champs mon pote ! 💪");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "workouts"), {
          userId: user.uid,
          machineName: selectedMachine.name,
          exercise: selectedExercise,
          sets: parseInt(sets),
          reps: parseInt(reps),
          weight: parseFloat(weight),
          date: serverTimestamp(),
        });

        Alert.alert("Succès", "Séance enregistrée ! 🔥");
        closeModal();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible d'enregistrer.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedMachine(null);
    setSelectedExercise("");
    setSets("");
    setReps("");
    setWeight("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Nouvelle Séance</Text>

      <SectionList
        sections={MACHINES_DATA}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.machineItem}
            onPress={() => setSelectedMachine(item)}
          >
            <View>
              <Text style={styles.machineName}>{item.name}</Text>
              <Text style={styles.machineTarget}>{item.target}</Text>
            </View>
            <IconSymbol name="plus.circle.fill" size={24} color="#FF6600" />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* MODAL DE SAISIE */}
      <Modal visible={selectedMachine !== null} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedMachine?.name}</Text>

            <ScrollView>
              <Text style={styles.label}>Choisir l'exercice :</Text>
              <View style={styles.exerciseRow}>
                {selectedMachine?.exercises.map((ex: string) => (
                  <TouchableOpacity
                    key={ex}
                    style={[styles.chip, selectedExercise === ex && styles.chipActive]}
                    onPress={() => setSelectedExercise(ex)}
                  >
                    <Text style={selectedExercise === ex ? styles.chipTextActive : styles.chipText}>{ex}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.label}>Séries</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={sets} onChangeText={setSets} placeholder="0" />
                </View>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.label}>Reps</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={reps} onChangeText={setReps} placeholder="0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Poids (kg)</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} placeholder="0" />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkout}>
                <Text style={styles.saveButtonText}>ENREGISTRER</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 20, paddingTop: 60 },
  mainTitle: { fontSize: 28, fontWeight: '900', color: '#FF6600', marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#FFF', backgroundColor: '#1E1E1E', padding: 10, borderRadius: 8, marginTop: 20, marginBottom: 10 },
  machineItem: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  machineName: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  machineTarget: { color: '#888', fontSize: 13, marginTop: 2 },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, minHeight: '50%' },
  modalTitle: { color: '#FF6600', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  label: { color: '#FFF', marginBottom: 10, fontSize: 14, fontWeight: '600' },
  exerciseRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  chip: { padding: 10, borderWidth: 1, borderColor: '#333', borderRadius: 20, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#FF6600', borderColor: '#FF6600' },
  chipText: { color: '#888' },
  chipTextActive: { color: '#FFF', fontWeight: 'bold' },
  inputRow: { flexDirection: 'row', marginBottom: 30 },
  input: { backgroundColor: '#333', borderRadius: 10, padding: 15, color: '#FFF', textAlign: 'center', fontSize: 18 },
  saveButton: { backgroundColor: '#FF6600', padding: 18, borderRadius: 15, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { marginTop: 15, alignItems: 'center', padding: 10 },
  cancelButtonText: { color: '#888' }
});
