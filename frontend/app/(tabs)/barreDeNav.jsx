import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  FlatList,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut } from 'firebase/auth';
import { Stack } from 'expo-router';
import DecScreen from './deconnexion';
import HistogramScreen from './histogramme';
import ParametreScreen from './parametre';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MyDrawe } from '@/components/drawer';

const CustomHeader = ({ setCurrentScreen, openMenu }) => {
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.header}>
      <Stack.Screen options={{ headerTransparent: true, headerTitle: "" }} />
      <View style={styles.imageContainer}>
        <Image source={require('@/assets/images/logom.jpg')} style={styles.image} />
      </View>
      <View style={styles.barre}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity>
          <Ionicons name='search' size={25} style={styles.imageIcon} />
        </TouchableOpacity>
        <Ionicons
          name='menu'
          size={30}
          color='black'
          onPress={openMenu} // Ouvrir le menu
          style={styles.dropdown}
        />
      </View>
    </View>
  );
};

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('accueil');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (currentScreen === 'accueil') {
        BackHandler.exitApp();
      } else {
        setCurrentScreen('accueil');
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentScreen]);

  const openMenu = () => {
    setModalVisible(true);
  };

  const closeMenu = () => {
    setModalVisible(false);
  };

  const handleMenuItemSelect = (value) => {
    closeMenu();
    if (value === 'deconnexion') {
      signOut(getAuth())
        .then(() => {
          AsyncStorage.removeItem('user');
          Alert.alert('Déconnexion réussie');
          setCurrentScreen('login');
        })
        .catch(() => {
          Alert.alert('Erreur', 'Erreur lors de la déconnexion.');
        });
    } else {
      setCurrentScreen(value);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader setCurrentScreen={setCurrentScreen} openMenu={openMenu} />
      {currentScreen === 'accueil' && <MyDrawe />}
      {currentScreen === 'histogramme' && <HistogramScreen />}
      {currentScreen === 'deconnexion' && <DecScreen />}
      {currentScreen === 'parametre' && <ParametreScreen />}

      {/* Modal pour afficher le menu */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeMenu}
      >
        <View style={styles.modalView}>
          <FlatList
            data={['accueil', 'histogramme', 'parametre', 'deconnexion']} // Liste des éléments de menu
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => handleMenuItemSelect(item)}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />
          <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 5,
    backgroundColor: '#fff',
    marginTop: 50,
    marginBottom: 10,
    elevation: 10,
  },
  imageContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  barre: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 5,
  },
  dropdown: {
    marginLeft: 30,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginVertical: 5,
    width: '80%',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 50,
    marginTop: 20,
    marginBottom: 30,
    elevation: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalItemText: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default App;
