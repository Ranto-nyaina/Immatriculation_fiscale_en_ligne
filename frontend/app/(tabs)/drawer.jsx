import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BarreView from './BarreView';
import AboutContactScreen from './apropos';
import DecScreen from './deconnexion';
import ChatScreen from './chat';
import ParametreScreen from './parametre';
import CustomHeader from './CustomHeader';
import BASE_URL from './config/config';
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const StackNav = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Menu">
      <Stack.Screen name="Menu" component={BarreView} />
      <Stack.Screen name="Aide" component={ChatScreen} />
      <Stack.Screen name="Parametre" component={ParametreScreen} />
      <Stack.Screen name="Deconnexion" component={DecScreen} />
      <Stack.Screen name="A propos" component={AboutContactScreen} />
    </Stack.Navigator>
  );
};

const BarreScreen = () => {
  const [hasNewMessages, setNewMessages] = useState(false);

  const fetchMessage = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/chat/`);
      const data = await response.json();

      if (data.length > 0) {
        const lastMessage = data.reduce((max, current) =>
          current.id > max.id ? current : max
        );

        const reponse = lastMessage.reponse;

        if (reponse) {
          setNewMessages(true);
        } else {
          setNewMessages(false);
        }
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchMessage();

    const interval = setInterval(fetchMessage, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerTransparent: false,
        header: () => <CustomHeader />,
      }}
    >
      <Drawer.Screen
        name="Accueil"
        component={StackNav}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Parametre"
        component={ParametreScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Aide"
        component={ChatScreen}
        options={{
          drawerLabel: ({ color }) => (
            <View style={styles.labelContainer}>
              <Text style={[styles.labelText, { color }]}>Aide</Text>
              {hasNewMessages && <View style={styles.notificationDot} />}
            </View>
          ),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="A propos"
        component={AboutContactScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Deconnexion"
        component={DecScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Permet de remplir tout l'espace disponible
  },
  labelText: {
    fontSize: 16,
    color: 'black',
  },
  notificationDot: {
    position: 'absolute', // Position absolue
    right: -25, // Place le point complètement à droite
    top: '50%', // Centrer verticalement
    transform: [{ translateY: -4 }], // Ajustement pour centrer précisément
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1379CD',
  },
});


export default BarreScreen;
