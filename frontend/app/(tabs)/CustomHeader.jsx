import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image, Modal, FlatList, Text, Button, Keyboard, Alert } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import BASE_URL from './config/config';
const CustomHeader = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [hasNewMessages, setNewMessages] = useState(false);

  const fetchMessage = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/chat/`);
      const data = await response.json();
  
      if (data.length > 0) {
        // Trouver l'entrée avec le plus grand ID
        const lastMessage = data.reduce((max, current) => 
          current.id > max.id ? current : max
        );
  
        const reponse = lastMessage.reponse; // Texte de la réponse
  
        // Vérifier si une réponse existe
        if (reponse) {
          setNewMessages(true);
        } else {
          setNewMessages(false);
        }
      }
    } catch (error) {
    }
  };
  


  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/transactions/`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
    }
  };

  // Use useFocusEffect to fetch data when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchMessage(); // Fetch messages on focus
      fetchTransactions()
    }, [])
  );

  // Automatically refresh transactions and messages periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchMessage(); // Refresh messages every 30 seconds
    }, 5000); // Refresh every 30 seconds

    // Cleanup interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  // Handle search logic
  const handleSearch = () => {
    const filtered = transactions.filter((transaction) => {
      const quitMatch = transaction.n_quit.toString().includes(searchText);
      const dateMatch = transaction.date_paiement.includes(searchText);
      const montantMatch = transaction.montant.toString().includes(searchText);

      return quitMatch || dateMatch || montantMatch;
    });

    setFilteredTransactions(filtered);
    setModalVisible(true);
    Keyboard.dismiss(); // Close the keyboard
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

      {/* Modal to display filtered transactions */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {filteredTransactions.length > 0 ? (
              <FlatList
                data={filteredTransactions}
                renderItem={({ item }) => (
                  <View style={styles.transactionRow}>
                    <Text>Quit: {item.n_quit}</Text>
                    <Text>Date: {item.date_paiement}</Text>
                    <Text>Montant: {item.montant}</Text>
                  </View>
                )}
                keyExtractor={(item) => item.n_quit.toString()}
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
});

export default CustomHeader;
