import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, BackHandler } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useNavigationState } from '@react-navigation/native';
import BASE_URL from './config/config';
import * as SecureStore from 'expo-secure-store';

const SplashScreen = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');

    if (!token) {
      router.push('/log_in');
      return;
    }

    const response = await fetch(`${BASE_URL}/api/check_session/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const result = await response.json();

    if (result.isAuthenticated) {
      router.push('/drawer');
    } else {
      await SecureStore.deleteItemAsync('auth_token'); // token invalide ou expiré
      router.push('/log_in');
    }
  } catch (error) {
    router.push('/log_in');
  } finally {
    setLoading(false);
  }
};

    checkSession();

    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove();
    };
  }, [router]);

  const state = useNavigationState((state) => state);
/* 
  useEffect(() => {
    console.log("Vous êtes sur l'écran:", state.routes[state.index].name);
  }, [state]); */

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#000',
  },
});

export default SplashScreen;
