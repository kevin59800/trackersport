import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6600', // Orange pour l'onglet actif
        tabBarInactiveTintColor: '#888',
        headerShown: false, // On cache le bandeau blanc du haut
        tabBarStyle: {
          backgroundColor: '#121212', // Fond noir pour la barre d'onglets
          borderTopColor: '#333',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        },
      }}>

      {/* 1er onglet : Le Profil (ton fichier profile.tsx) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mon Profil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />

      {/* 2ème onglet : Explorer (ton fichier explore.tsx) */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
