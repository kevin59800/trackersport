import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ Connecté -> Direction Profil");
        router.replace('/(tabs)/profile' as any);
      } else {
        console.log("❌ Déconnecté -> Direction Login");
        router.replace('/auth/login' as any);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* On liste les fichiers PRÉCISÉMENT pour éviter l'erreur "No route named auth" */}
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/setup-profile" />

        {/* Le groupe des onglets */}
        <Stack.Screen name="(tabs)" />

        {/* La modal racine */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
