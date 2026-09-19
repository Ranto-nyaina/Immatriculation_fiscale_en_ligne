import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { BarreView } from '../app/(tabs)/BarreView';
import DecScreen from '@/app/(tabs)/deconnexion';
import ChatScreen from '@/app/(tabs)/chat';
import ParametreScreen from '@/app/(tabs)/parametre';
import CustomHeader from '../app/(tabs)/CustomHeader'; // Importez votre en-tête personnalisé

const Drawer = createDrawerNavigator();

export const MyDrawe = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        header: () => <CustomHeader /> // Ajoutez l'en-tête personnalisé ici
      }}
    >
      <Drawer.Screen name="Accueil" component={BarreView} />
      <Drawer.Screen name="Aide" component={ChatScreen} />
      <Drawer.Screen name="Parametre" component={ParametreScreen} />
      <Drawer.Screen name="Deconnexion" component={DecScreen} />
    </Drawer.Navigator>
  );
};
