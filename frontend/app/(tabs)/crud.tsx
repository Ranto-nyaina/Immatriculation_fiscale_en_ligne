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

  const fetchData = () => {
    fetch(`${BASE_URL}/api/civisme_fiscale/`)
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => Alert.alert('Erreur', 'Impossible de charger les données.'));
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

  const createItem = () => {
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

    fetch(`${BASE_URL}/api/civisme_fiscale/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((createdItem) => {
        setData([...data, createdItem]);
        setNewItem({ description: '', question: '', reponse: '', video: null });
        Alert.alert('Succès', 'L\'élément a été créé.');
        setNewModalVisible(false);
      })
      .catch(() => Alert.alert('Erreur', 'Erreur lors de la création.'));
  };

  const updateItem = () => {
    const formData = new FormData();
    formData.append('description', selectedItem.description);
    formData.append('question', selectedItem.question);
    formData.append('reponse', selectedItem.reponse);
    if (selectedItem.video) {
      formData.append('video', {
        uri: selectedItem.video.uri,
        name: selectedItem.video.name,
        type: selectedItem.video.mimeType,
      });
    }

    fetch(`${BASE_URL}/api/civisme_fiscale/${selectedItem.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((updatedItem) => {
        setData(data.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
        Alert.alert('Succès', 'L\'élément a été mis à jour.');
        setModalVisible(false);
      })
      .catch(() => Alert.alert('Erreur', 'Erreur lors de la mise à jour.'));
  };

  const deleteItem = (id) => {
    fetch(`${BASE_URL}/api/civisme_fiscale/${id}/`, {
      method: 'DELETE',
    })
      .then(() => {
        setData(data.filter((item) => item.id !== id));
        Alert.alert('Succès', 'L\'élément a été supprimé.');
      })
      .catch(() => Alert.alert('Erreur', 'Erreur lors de la suppression.'));
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text>Description: {item.description}</Text>
      <Text>Question: {item.question}</Text>
      <Text>Réponse: {item.reponse}</Text>
      <Text>Vidéo: {item.video}</Text>
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
          <TouchableOpacity style={styles.button} onPress={selectVideo}>
            <Text style={styles.buttonText}>
              {selectedItem?.video ? 'Vidéo sélectionnée' : 'Choisir une vidéo'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButton} onPress={updateItem}>
            <Text style={styles.createButtonText}>Mettre à jour</Text>
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
