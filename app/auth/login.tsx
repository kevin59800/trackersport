import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: '984360239000-ku04n5o8ao4r4j6ma4liqt5utvh45j2o.apps.googleusercontent.com',
    iosClientId: '984360239000-doss9eb1eqe5ke5vdqgv90aiie2ikmgr.apps.googleusercontent.com',
    androidClientId: '984360239000-doss9eb1eqe5ke5vdqgv90aiie2ikmgr.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleAuth(id_token);
    }
  }, [response]);

  const handleGoogleAuth = async (token: string) => {
    setLoading(true);
    try {
      const credential = GoogleAuthProvider.credential(token);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid, email: user.email, createdAt: serverTimestamp(), profileCompleted: false
        });
      }

      router.replace(userDoc.exists() && userDoc.data()?.profileCompleted ? '/(tabs)/profile' : '/auth/setup-profile');
    } catch (error) {
      Alert.alert("Erreur", "Connexion Google échouée.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Erreur", "Remplissez tous les champs.");

    // Nettoyage de l'email (espaces et majuscules)
    const cleanEmail = email.trim().toLowerCase();

    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const userDoc = await getDoc(doc(db, "users", res.user.uid));
      router.replace(userDoc.exists() && userDoc.data()?.profileCompleted ? '/(tabs)/profile' : '/auth/setup-profile');
    } catch (error: any) {
      console.log("Erreur de connexion:", error.code);

      // Gestion des messages d'erreur selon le code Firebase
      let message = "Identifiants invalides.";
      if (error.code === 'auth/invalid-credential') message = "Email ou mot de passe incorrect.";
      if (error.code === 'auth/too-many-requests') message = "Compte bloqué temporairement suite à trop d'essais. Réessayez plus tard.";

      Alert.alert("Erreur", message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    const cleanResetEmail = resetEmail.trim().toLowerCase();

    if (!cleanResetEmail) {
      return Alert.alert("Erreur", "Veuillez entrer votre email.");
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, cleanResetEmail);
      setResetModalVisible(false);
      setResetEmail('');
      Alert.alert("Succès", "Un lien de réinitialisation a été envoyé à votre adresse email.");
    } catch (error: any) {
      console.error(error.code);
      Alert.alert("Erreur", "Impossible d'envoyer l'email. Vérifiez l'adresse.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <ScrollView contentContainerStyle={styles.container} bounces={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>SPORT<Text style={{color: '#FF6600'}}>TRACKER</Text></Text>
          <Text style={styles.subtitle}>Ravi de vous revoir !</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="votre@email.com"
            placeholderTextColor="#444"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>MOT DE PASSE</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#444"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={() => setResetModalVisible(true)}
            style={styles.forgotPasswordContainer}
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          >
            <Text style={styles.forgotPasswordText}>MOT DE PASSE OUBLIÉ ?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.loginButtonText}>SE CONNECTER</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()} disabled={!request || loading}>
          <Text style={styles.googleButtonText}>CONTINUER AVEC GOOGLE</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/auth/register')}>
          <Text style={styles.footerText}>Pas de compte ? <Text style={styles.footerHighlight}>S'inscrire</Text></Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={resetModalVisible} transparent animationType="fade" onRequestClose={() => setResetModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>RÉINITIALISATION</Text>
              <Text style={styles.modalSubtitle}>Entrez l'email associé à votre compte :</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="votre@email.com"
                placeholderTextColor="#444"
                value={resetEmail}
                onChangeText={setResetEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoFocus={Platform.OS !== 'web'}
              />

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleSendResetEmail}
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.modalConfirmText}>ENVOYER LE LIEN</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setResetModalVisible(false); setResetEmail(''); }}>
                <Text style={styles.modalCancelText}>ANNULER</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#121212', padding: 30, justifyContent: 'center' },
  header: { marginBottom: 40 },
  title: { fontSize: 36, color: '#FFF', fontWeight: 'bold', letterSpacing: -1 },
  subtitle: { color: '#666', fontSize: 16, marginTop: 5 },
  form: { width: '100%' },
  label: { color: '#FF6600', fontSize: 10, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, color: '#FFF', marginBottom: 15, borderWidth: 1, borderColor: '#333', fontSize: 16 },
  forgotPasswordContainer: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotPasswordText: { color: '#FF6600', fontSize: 11, fontWeight: 'bold' },
  loginButton: { backgroundColor: '#FFF', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  loginButtonText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  divider: { flex: 1, height: 1, backgroundColor: '#333' },
  dividerText: { color: '#444', paddingHorizontal: 15, fontSize: 12, fontWeight: 'bold' },
  googleButton: { width: '100%', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#333', alignItems: 'center', backgroundColor: 'transparent' },
  googleButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  footerLink: { marginTop: 30, alignItems: 'center' },
  footerText: { color: '#666', fontSize: 14 },
  footerHighlight: { color: '#FF6600', fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '100%', alignItems: 'center' },
  modalBox: { backgroundColor: '#1A1A1A', width: '85%', borderRadius: 25, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#FF6600', fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  modalSubtitle: { color: '#666', fontSize: 13, marginBottom: 20, textAlign: 'center' },
  modalInput: { backgroundColor: '#121212', width: '100%', borderRadius: 12, padding: 15, color: '#FFF', borderWidth: 1, borderColor: '#333', marginBottom: 20 },
  modalConfirmBtn: { backgroundColor: '#FF6600', width: '100%', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  modalConfirmText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  modalCancelText: { color: '#666', fontSize: 13, fontWeight: 'bold' }
});
