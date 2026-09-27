import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRouter } from 'expo-router';
import { CommonActions } from '@react-navigation/native';
import BASE_URL from './config/config';
import * as SecureStore from 'expo-secure-store';

const DecScreen = () => {
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();

  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Menu');
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Menu' }] }));
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUserInfo(JSON.parse(userData));
        }
      } catch (error) {
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const response = await fetch(`${BASE_URL}/api/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      await SecureStore.deleteItemAsync('auth_token');
      await AsyncStorage.removeItem('user');

      if (response.ok) {
        Alert.alert('Déconnexion réussie');
      }

      navigation.navigate('Menu');
      router.replace('/log_in');
    } catch (error) {
      await SecureStore.deleteItemAsync('auth_token');
      await AsyncStorage.removeItem('user');
      router.replace('/log_in');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voulez-vous déconnecter ?</Text>
      {userInfo && (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>Email : {userInfo.email}</Text>
          <Text style={styles.userInfoText}>Rôle : {userInfo.role}</Text>
        </View>
      )}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 20,
  },
  userInfoText: {
    fontSize: 18,
    marginBottom: 5,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#ff6347',
    borderRadius: 50,
    elevation: 5,
    marginTop: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default DecScreen;