import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  BackHandler,
  Image,
} from 'react-native';
import { Stack, useNavigation } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import BASE_URL from './config/config';

export default function AdminChatScreen() {
  const [data, setData] = useState([]);
  const navigation = useNavigation();

  // Recharger les données à chaque affichage de l'écran
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
      return () => {};
    }, [])
  );

  // Gestion du bouton retour
  useEffect(() => {
    const backAction = () => {
      navigation.replace('Menu');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Récupérer les données depuis l'API
  const fetchData = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const response = await fetch(`${BASE_URL}/api/AdminMessages/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 404 = aucun message → liste vide, pas une erreur
      if (response.status === 404) {
        setData([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const json = await response.json();
      setData(Array.isArray(json) ? json : []);
    } catch (error) {
      // Silencieux
    }
  };

  const handleTransactionSelect = (item) => {
    // 'SendMessage' est le nom défini dans StackNav (BarreAdminView.jsx)
    navigation.navigate('SendMessage', { selectedItem: item });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: '',
        }}
      />
      <FlatList
        data={data}
        keyExtractor={(item) => item.contribuable.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productBox}
            onPress={() => handleTransactionSelect(item)}
          >
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={styles.photo} />
            ) : (
              <View style={styles.photo} />
            )}
            <View style={styles.row}>
              <Text style={styles.cell}>{item.propr_prenif}</Text>
              <Text
                style={[
                  styles.cell,
                  item.questions && {
                    fontWeight: 'bold',
                    color: '#007AFF',
                  },
                ]}
              >
                {item.questions ? item.questions : item.reponses}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  productBox: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'column',
    marginLeft: 15,
    marginTop: 5,
  },
  cell: {
    flex: 1,
    paddingVertical: 5,
    fontSize: 16,
    textAlign: 'left',
    marginRight: 55,
    color: '#333',
  },
  photo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#eee',
  },
});