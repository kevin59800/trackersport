import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleGoogleAuth = async (id_token: string) => {
    setLoading(true);
    try {
      const credential = GoogleAuthProvider.credential(id_token);
      await signInWithCredential(auth, credential);
      router.replace('/auth/setup-profile');
    } catch (error) {
      Alert.alert("Erreur", "Connexion Google échouée.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async () => {
    if (!email || !password) return Alert.alert("Erreur", "Remplissez les champs.");
    if (password !== confirmPassword) return Alert.alert("Erreur", "Mots de passe différents.");
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid, email: res.user.email, createdAt: serverTimestamp(), profileCompleted: false
      });
      router.replace('/auth/setup-profile');
    } catch (error) {
      Alert.alert("Erreur", "L'inscription a échoué.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      <View style={styles.header}>
        <Text style={styles.title}>REJOINDRE<Text style={{color: '#FF6600'}}> L'ÉQUIPE</Text></Text>
        <Text style={styles.subtitle}>Commencez votre transformation dès aujourd'hui.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>EMAIL</Text>
        <TextInput style={styles.input} placeholder="votre@email.com" placeholderTextColor="#444" value={email} onChangeText={setEmail} autoCapitalize="none" />

        <Text style={styles.label}>MOT DE PASSE</Text>
        <TextInput style={styles.input} placeholder="Minimum 8 caractères" placeholderTextColor="#444" value={password} onChangeText={setPassword} secureTextEntry />

        <Text style={styles.label}>CONFIRMATION</Text>
        <TextInput style={styles.input} placeholder="Répétez le mot de passe" placeholderTextColor="#444" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        <TouchableOpacity style={styles.registerButton} onPress={handleEmailRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.registerButtonText}>CRÉER MON COMPTE</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OU</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()} disabled={!request || loading}>
        <Text style={styles.googleButtonText}>S'INSCRIRE AVEC GOOGLE</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/auth/login')}>
        <Text style={styles.footerText}>Déjà membre ? <Text style={styles.footerHighlight}>Se connecter</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#121212', padding: 30, justifyContent: 'center' },
  header: { marginBottom: 30 },
  title: { fontSize: 32, color: '#FFF', fontWeight: 'bold' },
  subtitle: { color: '#666', fontSize: 14, marginTop: 5 },
  form: { width: '100%' },
  label: { color: '#FF6600', fontSize: 10, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, color: '#FFF', marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  registerButton: { backgroundColor: '#FF6600', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  registerButtonText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  divider: { flex: 1, height: 1, backgroundColor: '#333' },
  dividerText: { color: '#444', paddingHorizontal: 15, fontSize: 12, fontWeight: 'bold' },
  googleButton: { width: '100%', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  googleButtonText: { color: '#FFF', fontWeight: 'bold' },
  footerLink: { marginTop: 30, alignItems: 'center' },
  footerText: { color: '#666' },
  footerHighlight: { color: '#FF6600', fontWeight: 'bold' }
});
