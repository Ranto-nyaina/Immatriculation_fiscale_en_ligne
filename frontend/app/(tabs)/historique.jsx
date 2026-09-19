import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  BackHandler,
  Button,
} from 'react-native';
import { Stack, useNavigation } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import BASE_URL from './config/config';

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Dark transparent background
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    width: '80%',  // Ensure modal width is consistent
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18, // Ensure consistent text size
    color: '#333', // Text color consistency
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    width: '45%',  // Adjust button width to make them evenly spaced
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default function HistoriqueScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
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
      const response = await fetch(`${BASE_URL}/api/central_recette/`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      const data = await response.json();
      setData(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les données');
    }
  };

  // Sélectionner une transaction
  const handleTransactionSelect = (item) => {
    setSelectedTransaction(item);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id_transaction.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productBox} onPress={() => handleTransactionSelect(item)}>
            <Text style={styles.productTitle}>{item.raison_sociale}</Text>
            <View style={styles.row}>
              <Text style={styles.cell}>RIB: {item.rib}</Text>
              <Text style={styles.cell}>Details: {item.imp_detail}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            {selectedTransaction && (
              <>
                <Text style={modalStyles.modalText}>Détails de la Transaction</Text>
                <View style={styles.table}>
                  <View style={styles.row}>
                    <Text style={styles.cell}>ID Transaction:</Text>
                    <Text style={styles.cell}>{selectedTransaction.id_transaction}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.cell}>Montant:</Text>
                    <Text style={styles.cell}>{selectedTransaction.mnt_ap}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.cell}>Date Début:</Text>
                    <Text style={styles.cell}>{selectedTransaction.date_debut}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.cell}>Date Fin:</Text>
                    <Text style={styles.cell}>{selectedTransaction.date_fin}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.cell}>Raison Sociale:</Text>
                    <Text style={styles.cell}>{selectedTransaction.raison_sociale}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.cell}>Banque:</Text>
                    <Text style={styles.cell}>{selectedTransaction.banque}</Text>
                  </View>
                </View>
              </>
            )}
            <View style={modalStyles.modalButtons}>
              <Button
                title="Fermer"
                onPress={() => setModalVisible(false)}
                color="#007bff"
                style={modalStyles.button}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  productBox: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  productTitle: {
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: 10,
  },
  table: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  cell: {
    flex: 1,
    padding: 5,
    textAlign: 'left',
  },
});
