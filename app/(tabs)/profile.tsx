import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
  Dimensions,
  FlatList
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { auth, db, analytics } from "../../firebaseConfig";
import { logEvent } from "firebase/analytics";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import workoutData from '../../constants/constants/workoutData';
import { useRouter } from "expo-router"; // Important pour la redirection si besoin

const screenWidth = Dimensions.get("window").width;
const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const DAYS_FULL = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Composant Historique (Gardé tel quel) ---
const ExerciseHistory = ({ name }: { name: string }) => {
  const [historyEntries, setHistoryEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const q = query(collection(db, "users", user.uid, "history"), where("exerciseName", "==", name));
        const querySnapshot = await getDocs(q);
        let data = querySnapshot.docs.map(doc => doc.data());
        data.sort((a, b) => {
          const parseDate = (d: string) => {
            const p = d.split('/');
            return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0])).getTime();
          };
          return parseDate(a.date) - parseDate(b.date);
        });
        setHistoryEntries(data.slice(-6));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchHistory();
  }, [name]);

  if (loading) return <ActivityIndicator size="small" color="#FF6600" style={{ margin: 10 }} />;
  const hasData = historyEntries.length >= 2;
  const chartData = {
    labels: historyEntries.map(item => item.date?.split('/')[0] + '/' + item.date?.split('/')[1] || ""),
    datasets: [{ data: historyEntries.map(item => Number(item.weight) || 0), color: (opacity = 1) => `rgba(255, 102, 0, ${opacity})`, strokeWidth: 3 }]
  };

  return (
    <View style={styles.historyContainer}>
      {hasData && (
        <>
          <Text style={styles.historyTitle}>PROGRESSION (KG)</Text>
          <LineChart
            data={chartData} width={screenWidth - 60} height={160}
            chartConfig={{ backgroundColor: "#161616", backgroundGradientFrom: "#161616", backgroundGradientTo: "#161616", decimalPlaces: 0, color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, labelColor: (opacity = 1) => `rgba(150, 150, 150, ${opacity})`, propsForDots: { r: "4", strokeWidth: "2", stroke: "#FF6600" } }}
            bezier style={{ marginVertical: 10, borderRadius: 10, marginLeft: -15 }}
          />
        </>
      )}
      <Text style={styles.historyTitle}>DERNIÈRES PERFORMANCES</Text>
      {[...historyEntries].reverse().map((item, index) => (
        <View key={index} style={styles.historyRow}>
          <View style={styles.timelineContainer}><View style={styles.timelineDot} />{index !== historyEntries.length - 1 && <View style={styles.timelineLine} />}</View>
          <View style={styles.historyInfo}>
            <Text style={styles.historyDate}>{item.date}</Text>
            <View style={styles.historyStats}><Text style={styles.historyWeight}>{item.weight}kg {item.sets} x {item.reps} reps</Text></View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const exerciseRefs = useRef<{ [key: string]: View }>({});

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // États Modales
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [selectedExData, setSelectedExData] = useState<any>(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [weeklySchedule, setWeeklySchedule] = useState<any>({"Lun": [], "Mar": [], "Mer": [], "Jeu": [], "Ven": [], "Sam": [], "Dim": []});

  // --- Logique de récupération des données ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 1. Récupérer les infos de l'utilisateur (Poids, Nom, etc.)
          const userSnap = await getDoc(doc(db, "users", user.uid));

          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            // Si l'utilisateur est connecté mais n'a pas de data, on l'envoie au setup
            router.replace("/auth/setup-profile");
            return;
          }

          // 2. Récupérer le planning
          const planSnap = await getDoc(doc(db, "users", user.uid, "config", "planning"));
          if (planSnap.exists()) {
            setWeeklySchedule(planSnap.data().schedule);
          }

          // Analytics
          if (analytics) {
            logEvent(analytics, 'screen_view', { screen_name: 'Profile', user_id: user.uid });
          }
        } catch (error) {
          console.error("Erreur chargement données profil:", error);
          Alert.alert("Erreur", "Impossible de charger votre profil.");
        } finally {
          setLoading(false);
        }
      } else {
        // Redirection vers login si déconnecté
        router.replace("/auth/login");
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Fonctions utilitaires ---
  const getTodayFull = () => {
    const dayIndex = new Date().getDay();
    const mapIndexToFull = [6, 0, 1, 2, 3, 4, 5];
    return DAYS_FULL[mapIndexToFull[dayIndex]];
  };

  const [planningModalVisible, setPlanningModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(getTodayFull());
  const [tempSelectedExercise, setTempSelectedExercise] = useState("Choisir un exercice...");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const todayName = DAYS_FR[new Date().getDay()];
  const allExercises = workoutData.flatMap(section => section.data.map(ex => ex.name));

  const saveSchedule = async (newSchedule: any) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "config", "planning"), { schedule: newSchedule });
    } catch (e) { Alert.alert("Erreur", "Sauvegarde échouée"); }
  };

  const addExerciseToDay = () => {
    if (!tempSelectedExercise || tempSelectedExercise === "Choisir un exercice...") {
        return Alert.alert("Infos", "Veuillez choisir un exercice dans la liste");
    }
    const newSchedule = { ...weeklySchedule };
    if (!newSchedule[selectedDay]) newSchedule[selectedDay] = [];

    if (newSchedule[selectedDay].find((e: any) => e.exerciseName === tempSelectedExercise)) {
      return Alert.alert("Infos", "Déjà dans ton planning pour ce jour");
    }
    newSchedule[selectedDay] = [...newSchedule[selectedDay], { id: Date.now().toString(), exerciseName: tempSelectedExercise }];
    setWeeklySchedule(newSchedule);
    saveSchedule(newSchedule);
    setTempSelectedExercise("Choisir un exercice...");
  };

  const removeExerciseFromDay = (id: string) => {
    const newSchedule = { ...weeklySchedule };
    newSchedule[selectedDay] = newSchedule[selectedDay].filter((e: any) => e.id !== id);
    setWeeklySchedule(newSchedule);
    saveSchedule(newSchedule);
  };

  const togglePicker = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsPickerOpen(!isPickerOpen);
  };

  const selectExercise = (name: string) => {
    setTempSelectedExercise(name);
    togglePicker();
  };

  const openLogModal = (machine: any) => {
    setSelectedExData(machine);
    const now = new Date();
    setCustomDate(`${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`);
    setLogModalVisible(true);
  };

  const confirmAddWithLog = async () => {
    if (!weight || !reps || !sets || !customDate) return Alert.alert("Erreur", "Remplis tout");
    const user = auth.currentUser;
    if (!user) return;
    try {
      const parts = customDate.split('/');
      const dateObject = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 12, 0, 0);
      await addDoc(collection(db, "users", user.uid, "history"), {
        exerciseName: selectedExData.name, weight: Number(weight), reps: Number(reps), sets: Number(sets), date: customDate, timestamp: Timestamp.fromDate(dateObject)
      });

      setLogModalVisible(false);
      setWeight(""); setReps(""); setSets("");
      Alert.alert("Succès", "Données enregistrées !");
    } catch (e) { Alert.alert("Erreur", "Erreur Firebase"); }
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedExerciseId(expandedExerciseId === id ? null : id);
  };

  const goToExercise = (exerciseName: string) => {
    let targetId = "";
    workoutData.forEach(s => { const f = s.data.find((ex: any) => ex.name === exerciseName); if (f) targetId = f.id; });
    if (targetId) {
      setExpandedExerciseId(targetId);
      exerciseRefs.current[targetId]?.measureLayout(
        //@ts-ignore
        scrollRef.current?.getInnerViewNode(),
        (x, y) => { scrollRef.current?.scrollTo({ y: y - 80, animated: true }); },
        () => {}
      );
    }
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#FF6600" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <ScrollView ref={scrollRef} style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <View style={styles.headerContent}>
                <View style={styles.userInfoRow}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : userData?.lastName?.charAt(0).toUpperCase() || "U"}
                        </Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.userName}>
                            {userData?.firstName} {userData?.lastName}
                        </Text>
                        <Text style={styles.userStats}>
                            {userData?.weight}kg • {userData?.height}cm • {userData?.age} ans
                        </Text>
                    </View>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity onPress={() => setPlanningModalVisible(true)} style={[styles.blackLogoutBtn, {marginRight: 10, backgroundColor: '#FF6600'}]}><Text style={[styles.blackLogoutBtnText, {color: '#000'}]}>PLANNING</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => signOut(auth)} style={styles.blackLogoutBtn}><Text style={styles.blackLogoutBtnText}>SORTIR</Text></TouchableOpacity>
                </View>
            </View>
        </View>

        {/* ... (Le reste de ton UI avec TodaySection et Body reste identique) ... */}
        <View style={styles.todaySection}>
          <Text style={styles.sectionLabel}>AUJOURD'HUI • {todayName.toUpperCase()}</Text>
          {weeklySchedule[todayName]?.length > 0 ? (
            <View style={styles.todayCard}>
              {weeklySchedule[todayName].map((ex: any) => (
                <TouchableOpacity key={ex.id} style={styles.todayExItem} onPress={() => goToExercise(ex.exerciseName)}>
                  <View style={styles.dot} /><Text style={styles.todayExName}>{ex.exerciseName}</Text><Text style={{color: '#444', fontSize: 10, marginLeft: 'auto'}}>HISTORIQUE ➔</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : <View style={styles.restCard}><Text style={styles.restText}>REPOS 😴</Text></View>}
        </View>

        <View style={styles.body}>
          {workoutData.map((section: any, idx: number) => (
            <View key={idx} style={styles.sectionWrapper}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.data.map((machine: any) => (
                <View key={machine.id} ref={(el) => { if (el) exerciseRefs.current[machine.id] = el; }} style={styles.machineCardWrapper}>
                  <TouchableOpacity style={styles.machineCard} onPress={() => toggleExpand(machine.id)}>
                    <View style={styles.imageContainer}><Image source={{ uri: machine.image }} style={styles.machineImage} resizeMode="contain" /></View>
                    <View style={{ flex: 1 }}><Text style={styles.machineName}>{machine.name}</Text></View>
                    <TouchableOpacity style={styles.addButton} onPress={() => openLogModal(machine)}><Text style={styles.addButtonText}>+</Text></TouchableOpacity>
                  </TouchableOpacity>
                  {expandedExerciseId === machine.id && <ExerciseHistory name={machine.name} />}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal Planning */}
      <Modal visible={planningModalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.logBox, { height: '85%', width: '95%', paddingHorizontal: 15 }]}>
            <Text style={styles.logTitle}>ORGANISER MA SEMAINE</Text>

            <View style={styles.calendarStrip}>
              {DAYS_FULL.map(day => (
                <TouchableOpacity key={day} onPress={() => setSelectedDay(day)} style={[styles.dayCircle, selectedDay === day && styles.dayCircleActive]}>
                  <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.dropdownContainer}>
              <Text style={styles.pickerLabel}>AJOUTER À MON PROGRAMME</Text>
              <View style={styles.pickerRow}>
                <View style={{flex: 1}}>
                    <TouchableOpacity style={styles.dropdownHeader} onPress={togglePicker}>
                        <Text style={[styles.dropdownHeaderText, tempSelectedExercise !== "Choisir un exercice..." && {color: '#FFF'}]}>
                            {tempSelectedExercise}
                        </Text>
                        <Text style={{color: '#FF6600', fontSize: 12, fontWeight: 'bold'}}>{isPickerOpen ? "▲" : "▼"}</Text>
                    </TouchableOpacity>
                    {isPickerOpen && (
                        <View style={styles.dropdownList}>
                            <FlatList
                                data={allExercises}
                                keyExtractor={(item, index) => index.toString()}
                                nestedScrollEnabled={true}
                                style={{ maxHeight: 200 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => selectExercise(item)} style={styles.dropdownItem}>
                                        <Text style={styles.dropdownItemText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}
                </View>
                {!isPickerOpen && (
                    <TouchableOpacity onPress={addExerciseToDay} style={styles.plusBtn}>
                        <Text style={styles.plusBtnText}>+</Text>
                    </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={{flex: 1, width: '100%', marginTop: 10}}>
                <Text style={styles.listHeader}>SÉANCE DU {selectedDay.toUpperCase()}</Text>
                <ScrollView style={{ flex: 1 }}>
                {weeklySchedule[selectedDay]?.length > 0 ? (
                    weeklySchedule[selectedDay].map((ex: any) => (
                    <View key={ex.id} style={styles.plannedRow}>
                        <Text style={styles.plannedText}>{ex.exerciseName}</Text>
                        <TouchableOpacity onPress={() => removeExerciseFromDay(ex.id)} style={styles.deleteBtn}>
                        <Text style={{color: '#FF4444', fontSize: 10, fontWeight: 'bold'}}>SUPPR.</Text>
                        </TouchableOpacity>
                    </View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}><Text style={styles.emptyText}>Aucun exercice prévu</Text></View>
                )}
                </ScrollView>
            </View>

            <TouchableOpacity style={[styles.confirmBtn, {marginTop: 15}]} onPress={() => setPlanningModalVisible(false)}>
              <Text style={styles.confirmBtnText}>TERMINER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Enregistrement Log */}
      <Modal visible={logModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.logBox}>
            <Text style={styles.logTitle}>ENREGISTRER</Text>
            <View style={styles.dateInputWrapper}><TextInput style={styles.dateInput} value={customDate} onChangeText={setCustomDate} placeholder="JJ/MM/AAAA" placeholderTextColor="#444" /></View>
            <View style={styles.inputGroup}>
              <View style={styles.inputField}><Text style={styles.inputLabel}>KG</Text><TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} /></View>
              <View style={styles.inputField}><Text style={styles.inputLabel}>SÉRIES</Text><TextInput style={styles.input} keyboardType="numeric" value={sets} onChangeText={setSets} /></View>
              <View style={styles.inputField}><Text style={styles.inputLabel}>REPS</Text><TextInput style={styles.input} keyboardType="numeric" value={reps} onChangeText={setReps} /></View>
            </View>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmAddWithLog}><Text style={styles.confirmBtnText}>VALIDER</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setLogModalVisible(false)}><Text style={{color: '#666', marginTop: 15}}>ANNULER</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Garde tes styles ils sont parfaits
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  header: { backgroundColor: "#1A1A1A", paddingHorizontal: 20, paddingBottom: 25, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#333' },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userInfoRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 23, backgroundColor: '#FF6600', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#000', fontWeight: 'bold', fontSize: 18 },
  infoContainer: { marginLeft: 12 },
  userName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  userStats: { color: '#666', fontSize: 12 },
  blackLogoutBtn: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  blackLogoutBtnText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  todaySection: { paddingHorizontal: 20, marginBottom: 20, marginTop: 20 },
  sectionLabel: { color: '#666', fontSize: 11, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  todayCard: { backgroundColor: '#1E1E1E', borderRadius: 15, padding: 10 },
  todayExItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6600', marginRight: 12 },
  todayExName: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  restCard: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 15, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#333' },
  restText: { color: '#444', fontWeight: 'bold' },
  body: { padding: 20 },
  sectionWrapper: { marginBottom: 25 },
  sectionTitle: { color: '#FF6600', fontSize: 14, fontWeight: 'bold', marginBottom: 15 },
  machineCardWrapper: { backgroundColor: '#1E1E1E', borderRadius: 15, marginBottom: 10, overflow: 'hidden' },
  machineCard: { padding: 12, flexDirection: 'row', alignItems: 'center' },
  imageContainer: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#121212', marginRight: 15, padding: 5 },
  machineImage: { width: '100%', height: '100%', tintColor: '#FF6600' },
  machineName: { color: '#FFF', fontWeight: 'bold' },
  addButton: { backgroundColor: '#252525', width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#FF6600', fontSize: 20 },
  historyContainer: { backgroundColor: '#161616', padding: 15, borderTopWidth: 1, borderTopColor: '#222' },
  historyTitle: { color: '#FF6600', fontSize: 10, fontWeight: 'bold', marginBottom: 15 },
  historyRow: { flexDirection: 'row', marginBottom: 5 },
  timelineContainer: { alignItems: 'center', marginRight: 15, width: 10 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6600', marginTop: 5 },
  timelineLine: { width: 1, flex: 1, backgroundColor: '#333' },
  historyInfo: { flex: 1, paddingBottom: 15 },
  historyDate: { color: '#666', fontSize: 11, marginBottom: 4 },
  historyStats: { flexDirection: 'row', alignItems: 'center' },
  historyWeight: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginRight: 10 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.98)', justifyContent: 'center', alignItems: 'center' },
  logBox: { backgroundColor: '#1A1A1A', width: '85%', borderRadius: 25, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  logTitle: { color: '#FF6600', fontWeight: 'bold', fontSize: 18, marginBottom: 20 },
  calendarStrip: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 25 },
  dayCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  dayCircleActive: { backgroundColor: '#FF6600' },
  dayText: { color: '#666', fontSize: 12, fontWeight: 'bold' },
  dayTextActive: { color: '#000' },
  dropdownContainer: { width: '100%', marginBottom: 10, zIndex: 100 },
  pickerLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', letterSpacing: 1 },
  pickerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  dropdownHeader: { flexDirection: 'row', backgroundColor: '#222', padding: 15, borderRadius: 12, justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  dropdownHeaderText: { color: '#444', fontSize: 14 },
  dropdownList: { backgroundColor: '#1A1A1A', borderRadius: 12, marginTop: 5, borderWidth: 1, borderColor: '#FF6600', overflow: 'hidden', position: 'absolute', top: 50, left: 0, right: 0, zIndex: 999, elevation: 5 },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
  dropdownItemText: { color: '#FFF', fontSize: 14 },
  plusBtn: { backgroundColor: '#FF6600', width: 50, height: 50, borderRadius: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  plusBtnText: { color: '#000', fontSize: 30, fontWeight: 'bold' },
  listHeader: { color: '#FF6600', fontSize: 12, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  plannedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#222', padding: 15, borderRadius: 12, marginBottom: 8 },
  plannedText: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  deleteBtn: { backgroundColor: 'rgba(255, 68, 68, 0.1)', padding: 8, borderRadius: 6 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#444', fontSize: 13, fontStyle: 'italic' },
  dateInputWrapper: { width: '100%', marginBottom: 20, alignItems: 'center' },
  dateInput: { backgroundColor: '#222', width: '60%', height: 40, borderRadius: 10, color: '#FFF', textAlign: 'center', fontSize: 14, borderWidth: 1, borderColor: '#333' },
  inputGroup: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  inputField: { alignItems: 'center', flex: 1 },
  inputLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#222', width: '80%', height: 50, borderRadius: 12, color: '#FFF', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  confirmBtn: { backgroundColor: '#FF6600', paddingVertical: 15, borderRadius: 15, width: '100%', alignItems: 'center' },
  confirmBtnText: { color: '#000', fontWeight: 'bold' }
});
