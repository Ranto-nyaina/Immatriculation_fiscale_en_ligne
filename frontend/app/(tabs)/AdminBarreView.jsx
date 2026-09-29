import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SecureStore from 'expo-secure-store';
import AdminChat from './AdminChat';
import AboutContactScreen from './apropos';
import DecScreen from './deconnexion';
import AdminCustomHeader from './AdminCustomHeader';
import AdminMessageScreen from './AdminMessage';
import HomeScreen from './HomeScreen';
import BASE_URL from './config/config';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Onglets du bas :
//   Accueil  → liste des conversations (AdminChat = AdminChat.jsx)
//   Civisme  → CRUD civisme fiscal (HomeScreen)
const TabNav = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1379CD',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Accueil') iconName = 'home-outline';
          else if (route.name === 'Civisme') iconName = 'document-text-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Accueil" component={AdminChat} />
      <Tab.Screen name="Civisme" component={HomeScreen} />
    </Tab.Navigator>
  );
};

const StackNav = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Menu">
      <Stack.Screen name="Menu" component={TabNav} />
      <Stack.Screen name="Adminchat" component={AdminChat} />
      <Stack.Screen name="SendMessage" component={AdminMessageScreen} />
      <Stack.Screen name="Civisme" component={HomeScreen} />
      <Stack.Screen name="Deconnexion" component={DecScreen} />
      <Stack.Screen name="A propos" component={AboutContactScreen} />
    </Stack.Navigator>
  );
};

const BarreAdminScreen = () => {
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const fetchMessage = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const response = await fetch(`${BASE_URL}/api/AdminMessages/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 404 = « aucun message » → pas une erreur
      if (response.status === 404) {
        setHasNewMessages(false);
        return;
      }

      if (!response.ok) {
        setHasNewMessages(false);
        return;
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        setHasNewMessages(false);
        return;
      }

      const questions = data.map((item) => item.questions);

      if (questions.some((q) => q !== null && q !== undefined)) {
        setHasNewMessages(true);
      } else {
        setHasNewMessages(false);
      }
    } catch (error) {
      // Silencieux
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
        header: () => <AdminCustomHeader />,
      }}
    >
      <Drawer.Screen
        name="Accueil"
        component={StackNav}
        options={{
          drawerLabel: ({ color }) => (
            <View style={styles.labelContainer}>
              <Text style={[styles.labelText, { color }]}>Aide</Text>
              {hasNewMessages && <View style={styles.notificationDot} />}
            </View>
          ),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
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
    flex: 1,
  },
  labelText: {
    fontSize: 16,
    color: 'black',
  },
  notificationDot: {
    position: 'absolute',
    right: -25,
    top: '50%',
    transform: [{ translateY: -4 }],
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1379CD',
  },
});

export default BarreAdminScreen;