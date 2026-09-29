import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image, Modal, FlatList, Text, Button, Keyboard } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import BASE_URL from './config/config';

const AdminCustomHeader = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [hasNewMessages, setNewMessages] = useState(false);

  const fetchMessage = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const response = await fetch(`${BASE_URL}/api/AdminMessages/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 404 = aucun message, ce n'est pas une erreur
      if (response.status === 404) {
        setNewMessages(false);
        return;
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        setNewMessages(false);
        return;
      }

      const reponse = data.map((item) => item.questions);

      if (reponse.some((question) => question !== null && question !== undefined)) {
        setNewMessages(true);
      } else {
        setNewMessages(false);
      }
    } catch (error) {
      // Silencieux
    }
  };

  const fetchTransactions = async (text = searchText) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const response = await fetch(
        `${BASE_URL}/api/AdminSearch/?search=${encodeURIComponent(text)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setTransactions(list);
      return list;
    } catch (error) {
      return [];
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchMessage();
      fetchTransactions();
    }, [])
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchMessage();
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSearch = async () => {
    const list = await fetchTransactions(searchText);
    const filtered = list.filter((transaction) => {
      return transaction.propr_prenif.toString().includes(searchText);
    });

    setFilteredTransactions(filtered);
    setModalVisible(true);
    Keyboard.dismiss();
  };

  const handleTransactionSelect = (item) => {
    setModalVisible(false);
    setSearchText('');
    navigation.navigate('SendMessage', { selectedItem: item });
  };

  const photoUri = (photo) => {
    if (!photo) return null;
    return photo.startsWith('data:image') ? photo : `data:image/png;base64,${photo}`;
  };

  return (
    <View style={styles.header}>
      <Image source={require('@/assets/images/LOGO_MEF.jpeg')} style={styles.logo} />
      <TextInput
        style={styles.searchInput}
        placeholder="Recherche"
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
      />
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
        <View style={styles.iconContainer}>
          <Ionicons name="menu" size={30} color="black" />
          {hasNewMessages && <View style={styles.notificationDot} />}
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {filteredTransactions.length > 0 ? (
              <FlatList
                data={filteredTransactions}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.productBox}
                    onPress={() => handleTransactionSelect(item)}
                  >
                    {photoUri(item.photo) ? (
                      <Image source={{ uri: photoUri(item.photo) }} style={styles.photo} />
                    ) : (
                      <View style={styles.photo} />
                    )}

                    <View style={styles.transactionRow}>
                      <Text>PRENIF: {item.propr_prenif}</Text>
                      <Text>NOM: {item.propr_name}</Text>
                      <Text>PRENOM: {item.last_name}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.propr_prenif.toString()}
              />
            ) : (
              <Text style={styles.noResultText}>Pas de résultat</Text>
            )}
            <Button
              title="Fermer"
              onPress={() => { setModalVisible(false); setSearchText(''); }}
              color="#007bff"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 5,
    marginTop: 40,
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 100,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  transactionRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  noResultText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginVertical: 20,
  },
  iconContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1379CD',
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
  photo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#eee',
  },
});

export default AdminCustomHeader;