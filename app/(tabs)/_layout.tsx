import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Cette ligne désactive complètement l'affichage du menu en bas
        tabBarStyle: { display: 'none' },
      }}>

      {/* L'index reste là pour la logique de redirection au démarrage */}
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />

      {/* Ton écran principal */}
      <Tabs.Screen
        name="profile"
      />

      {/* On cache explore */}
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}
