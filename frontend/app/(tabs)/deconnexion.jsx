import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRouter } from 'expo-router';
import { CommonActions } from '@react-navigation/native';
import BASE_URL from './config/config';
const DecScreen = () => {
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();

  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Menu'); // Retourner à l'écran précédent
      navigation.dispatch(CommonActions.reset({index: 0, routes: [{name:'Menu'}]}));
      return true; // Empêcher le comportement par défaut
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove(); // Nettoyer l'écouteur lors du démontage du composant
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
      const response = await fetch(`${BASE_URL}/api/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        await AsyncStorage.removeItem('user');
        Alert.alert('Déconnexion réussie');
        navigation.navigate('Menu'); // Retourner à l'écran précédent
        router.replace('/log_in');
      } else {
        const errorResponse = await response.json();
        Alert.alert('Erreur', errorResponse.message || 'Erreur lors de la déconnexion.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la déconnexion.');
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
