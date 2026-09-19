import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, BackHandler } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useNavigationState } from '@react-navigation/native';
import BASE_URL from './config/config';

const SplashScreen = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/check_session/`, {
          method: 'GET',
          credentials: 'include', // pour inclure le cookie de session
        });
        const result = await response.json();
        if (result.isAuthenticated) {
          if (result.prenif==='0000000000') {
            router.push('/AdminBarreView');
          } else {
            router.push('/drawer');
          }
        } else {
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
