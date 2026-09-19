import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarStyle: {
          display: route.name === 'log_in' || route.name === 'sign_up'
            || route.name === 'histogramme' || route.name === 'barreDeNav'  
            || route.name === 'deconnexion' || route.name === 'accueil' || route.name === 'index'
             || route.name === 'motDepasse' || route.name === 'drawer' || route.name === 'AdminBarreView'
             || route.name === 'AdminMessage'
           ? 'none' : 'flex',
        },
        headerShown: false, // Toujours masquer l'en-tête
      })}
    > 
    </Tabs>
  );
}
