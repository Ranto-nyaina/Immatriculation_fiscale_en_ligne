import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  BackHandler,
  Image,
} from 'react-native';
import { Stack, useNavigation } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import BASE_URL from './config/config';

export default function AdminchatScreen() {
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
      const response = await fetch(`${BASE_URL}/api/AdminMessages/`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      const data = await response.json();
      setData(data);
    } catch (error) {
    }
  };

  const handleTransactionSelect = (item) => {
    navigation.navigate('AdminMessage', { selectedItem: item }); 
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
            onPress={() => handleTransactionSelect(item)} // Lors du clic, rediriger
          >
            <Image source={{ uri: item.photo }} style={styles.photo} />
            <View style={styles.row}>
              <Text style={styles.cell}>{item.propr_prenif}</Text>
              <Text
                style={[
                  styles.cell,
                  item.questions && {
                    fontWeight: 'bold',
                    color: '#007AFF', // Highlight the text
                  },
                ]}
              >
                {item.questions
                  ? item.questions
                  : item.reponses}
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
  },
});
