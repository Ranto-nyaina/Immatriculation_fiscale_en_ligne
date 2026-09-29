import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import BASE_URL from './config/config';
import * as SecureStore from 'expo-secure-store';

const HomeScreen = () => {
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newModalVisible, setNewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    description: '',
    question: '',
    reponse: '',
    video: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const getToken = async () => {
    return await SecureStore.getItemAsync('auth_token');
  };

  const fetchData = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${BASE_URL}/api/civisme_fiscale/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        Alert.alert('Erreur', `Chargement impossible (${response.status})`);
        return;
      }
      const json = await response.json();
      setData(Array.isArray(json) ? json : []);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données.');
    }
  };

  const selectVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
      });
      if (result.type === 'success') {
        setNewItem({ ...newItem, video: result });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la sélection de la vidéo.');
    }
  };

  const selectVideoForUpdate = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
      });
      if (result.type === 'success') {
        setSelectedItem({ ...selectedItem, video: result });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la sélection de la vidéo.');
    }
  };

  const createItem = async () => {
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('description', newItem.description);
      formData.append('question', newItem.question);
      formData.append('reponse', newItem.reponse);
      if (newItem.video) {
        formData.append('video', {
          uri: newItem.video.uri,
          name: newItem.video.name,
          type: newItem.video.mimeType,
        });
      }

      const response = await fetch(`${BASE_URL}/api/civisme_fiscale/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        Alert.alert('Erreur', `Création impossible (${response.status})`);
        return;
      }

      const createdItem = await response.json();
      setData([...data, createdItem]);
      setNewItem({ description: '', question: '', reponse: '', video: null });
      Alert.alert('Succès', "L'élément a été créé.");
      setNewModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la création.');
    }
  };

  const updateItem = async () => {
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('description', selectedItem.description);
      formData.append('question', selectedItem.question);
      formData.append('reponse', selectedItem.reponse);

      if (
        selectedItem.video &&
        typeof selectedItem.video === 'object' &&
        selectedItem.video.uri
      ) {
        formData.append('video', {
          uri: selectedItem.video.uri,
          name: selectedItem.video.name,
          type: selectedItem.video.mimeType,
        });
      }

      const response = await fetch(
        `${BASE_URL}/api/civisme_fiscale/${selectedItem.id}/`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.log('ERREUR PUT:', response.status, errorBody);
        Alert.alert('Erreur', `Mise à jour impossible (${response.status})\n${errorBody}`);
        return;
      }

      const updatedItem = await response.json();
      setData(data.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
      Alert.alert('Succès', "L'élément a été mis à jour.");
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la mise à jour.');
    }
  };

  const deleteItem = async (id) => {
    try {
      const token = await getToken();
      const response = await fetch(`${BASE_URL}/api/civisme_fiscale/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        Alert.alert('Erreur', `Suppression impossible (${response.status})`);
        return;
      }

      setData(data.filter((item) => item.id !== id));
      Alert.alert('Succès', "L'élément a été supprimé.");
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la suppression.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text>Description: {item.description}</Text>
      <Text>Question: {item.question}</Text>
      <Text>Réponse: {item.reponse}</Text>
      <Text>
        Vidéo:{' '}
        {typeof item.video === 'object' && item.video !== null
          ? item.video.uri || 'Vidéo'
          : item.video || 'Aucune'}
      </Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setSelectedItem(item);
            setModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: 'red' }]}
          onPress={() => deleteItem(item.id)}
        >
          <Text style={styles.buttonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setNewModalVisible(true)}
      >
        <Text style={styles.createButtonText}>Ajouter un élément</Text>
      </TouchableOpacity>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {/* Modal : modification */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.title}>Modifier l'élément</Text>
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={selectedItem?.description}
            onChangeText={(text) =>
              setSelectedItem({ ...selectedItem, description: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Question"
            value={selectedItem?.question}
            onChangeText={(text) =>
              setSelectedItem({ ...selectedItem, question: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Réponse"
            value={selectedItem?.reponse}
            onChangeText={(text) =>
              setSelectedItem({ ...selectedItem, reponse: text })
            }
          />
          <TouchableOpacity style={styles.button} onPress={selectVideoForUpdate}>
            <Text style={styles.buttonText}>
              {selectedItem?.video ? 'Vidéo sélectionnée' : 'Choisir une vidéo'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButton} onPress={updateItem}>
            <Text style={styles.createButtonText}>Mettre à jour</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'gray', marginTop: 10 }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal : création */}
      <Modal visible={newModalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.title}>Ajouter un élément</Text>
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={newItem.description}
            onChangeText={(text) => setNewItem({ ...newItem, description: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Question"
            value={newItem.question}
            onChangeText={(text) => setNewItem({ ...newItem, question: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Réponse"
            value={newItem.reponse}
            onChangeText={(text) => setNewItem({ ...newItem, reponse: text })}
          />
          <TouchableOpacity style={styles.button} onPress={selectVideo}>
            <Text style={styles.buttonText}>
              {newItem.video ? 'Vidéo sélectionnée' : 'Choisir une vidéo'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButton} onPress={createItem}>
            <Text style={styles.createButtonText}>Créer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'gray', marginTop: 10 }]}
            onPress={() => setNewModalVisible(false)}
          >
            <Text style={styles.buttonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  item: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  modal: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default HomeScreen;