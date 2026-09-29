import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        const storedRole = await SecureStore.getItemAsync('user_role');
        setIsAuthenticated(!!token);
        setRole(storedRole);
      } catch (e) {
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };
    checkSession();
  }, []);

  if (isChecking) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1379CD" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/log_in" />;
  }

  if (role === 'admin') {
    return <Redirect href="/AdminBarreView" />;
  }

  return <Redirect href="/drawer" />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});