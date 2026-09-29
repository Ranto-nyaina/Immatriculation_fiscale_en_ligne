import { Stack } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="log_in">
      <Stack.Screen name="accueil" />
      <Stack.Screen name="AdminBarreView" />
      <Stack.Screen name="AdminChat" />
      <Stack.Screen name="AdminCustomHeader" />
      <Stack.Screen name="AdminMessage" />
      <Stack.Screen name="apropos" />
      <Stack.Screen name="barreDeNav" />
      <Stack.Screen name="BarreView" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="CustomHeader" />
      <Stack.Screen name="deconnexion" />
      <Stack.Screen name="drawer" />
      <Stack.Screen name="histogramme" />
      <Stack.Screen name="historique" />
      <Stack.Screen name="HomeScreen" />
      <Stack.Screen name="log_in" />
      <Stack.Screen name="motDepasse" />
      <Stack.Screen name="parametre" />
      <Stack.Screen name="sign_up" />
    </Stack>
  );
}