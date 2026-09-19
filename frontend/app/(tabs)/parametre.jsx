import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, BackHandler, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from './config/config';

const ParametreScreen = () => {
  const navigation = useNavigation();
  const [photo, setPhoto] = useState(null);
  const [proprPrenif, setProprPrenif] = useState('');
  const [proprCIN, setProprCIN] = useState('');
  const [email, setEmail] = useState('');
  const [proprName, setProprName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userToken, setUserToken] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); // État pour contrôler la visibilité du modal
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [showPhotoConfirmModal, setShowPhotoConfirmModal] = useState(false);
  const [tempPhoto, setTempPhoto] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Désolé, nous avons besoin de la permission pour accéder aux photos!');
      }
    })();
  }, []);

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Menu');
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/get_user_info/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setProprName(data.propr_name);
        setProprCIN(data.propr_cin);
        setProprPrenif(data.propr_prenif);
        setLastName(data.last_name);
        setEmail(data.mailing_address);
        setPhoneNumber(data.phone_number);
        if (data.photo) {
          setPhoto(data.photo);
        }
      } else {
        Alert.alert('Erreur', data.error || 'Impossible de récupérer les informations de l\'utilisateur');
      }
    } catch (error) {
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setTempPhoto(result.assets[0].uri);
      setShowPhotoConfirmModal(true);
    }
  };

  const confirmPhotoChange = async () => {
    setIsLoading(true);
    try {
      const base64Photo = await convertToBase64(tempPhoto);
      const requestBody = {
        photo: base64Photo.split(',')[1]
      };

      const response = await fetch(`${BASE_URL}/api/update_user_info/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseJson = await response.json();

      if (response.ok) {
        setPhoto(tempPhoto);
        Alert.alert('Succès', 'Photo de profil mise à jour avec succès');
      } else {
        Alert.alert('Erreur', responseJson.message || 'Erreur lors de la mise à jour de la photo');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de communication avec le serveur.');
    } finally {
      setIsLoading(false);
      setShowPhotoConfirmModal(false);
    }
  };
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const requestBody = {};

      // Ajouter les informations modifiées dans le body de la requête
      if (proprName) requestBody.propr_name = proprName;
      if (lastName) requestBody.last_name = lastName;
      if (phoneNumber) requestBody.phone_number = phoneNumber;
      if (email) requestBody.mailing_address = email;

      // Envoi de la requête POST avec les champs modifiés
      const response = await fetch(`${BASE_URL}/api/update_user_info/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseJson = await response.json();

      if (response.ok) {
        Alert.alert('Message', responseJson.message);
      } else {
        Alert.alert('Erreur', responseJson.message || 'Erreur lors de la mise à jour des informations.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de communication avec le serveur.');
    } finally {
      setIsLoading(false);
      setHasChanges(false);
    }
  };

  // Fonction pour vérifier la force du mot de passe
  const isStrongPassword = (password) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handlePasswordChange = async () => {
    setIsPasswordChanging(true);
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas.');
      setIsPasswordChanging(false);
      return;
    }
    if (!newPassword || !confirmPassword || !currentPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      setIsPasswordChanging(false);
      return;
    }

    if (!isStrongPassword(newPassword)) {
      Alert.alert(
        'Mot de passe faible',
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.'
      );
      setIsPasswordChanging(false);
      return;
    }

    try {
      const requestBody = {
        current_password: currentPassword,
        new_password: newPassword,
      };

      const response = await fetch(`${BASE_URL}/api/change_password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseJson = await response.json();

      if (response.ok) {
        Alert.alert('Succès', 'Mot de passe modifié avec succès!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setModalVisible(false); // Ferme le modal après succès
      } else {
        Alert.alert('Erreur', responseJson.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de communication avec le serveur.');
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const convertToBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paramètres</Text>

      <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <Text style={styles.photoPlaceholder}>Ajouter une photo</Text>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Prénom"
        value={proprName}
        onChangeText={(text) => {
          setProprName(text);
          setHasChanges(true);
        }}
        style={styles.input}
      />

      <TextInput
        placeholder="Nom"
        value={lastName}
        onChangeText={(text) => {
          setLastName(text);
          setHasChanges(true);
        }}
        style={styles.input}
      />
      <TextInput
        placeholder="email@gmail.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setHasChanges(true);
        }}
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Numéro de téléphone"
        value={phoneNumber}
        onChangeText={(text) => {
          setPhoneNumber(text);
          setHasChanges(true);
        }}
        keyboardType="phone-pad"
        style={styles.input}
      />

      {hasChanges && (
        <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isLoading}>
          <Text style={styles.saveButtonText}>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</Text>
        </TouchableOpacity>
      )}
      <View style={styles.infoUser}>
        <Text style={styles.info}>C.I.N:  {proprCIN}</Text>
        <Text style={styles.info}>PRENIF: {proprPrenif}</Text>
      </View>
      {/* Bouton pour ouvrir le modal de changement de mot de passe */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.passwordButton} disabled={isPasswordChanging}>
        <Text style={styles.passwordButtonText}>{isPasswordChanging ? 'Changement...' : 'Changer le mot de passe'}</Text>
      </TouchableOpacity>

      {/* Modal pour changer le mot de passe */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Changer le mot de passe</Text>

            <TextInput
              placeholder="Mot de passe actuel"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={styles.input}
            />

            <TextInput
              placeholder="Nouveau mot de passe"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
            />

            <TextInput
              placeholder="Confirmer le mot de passe"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />

            <TouchableOpacity onPress={handlePasswordChange} style={styles.saveButton} disabled={isPasswordChanging}>
              <Text style={styles.saveButtonText}>{isPasswordChanging ? 'Changement...' : 'Changer'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {setModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');}} style={styles.cancelButton}>
              <Text style={styles.saveButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Photo confirmation modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPhotoConfirmModal}
        onRequestClose={() => setShowPhotoConfirmModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmer le changement de photo</Text>
            <Image source={{ uri: tempPhoto }} style={styles.photoPreview} />
            <TouchableOpacity onPress={confirmPhotoChange} style={styles.saveButton} disabled={isLoading}>
              <Text style={styles.saveButtonText}>{isLoading ? 'Mise à jour...' : 'Confirmer'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPhotoConfirmModal(false)} style={styles.cancelButton}>
              <Text style={styles.saveButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 35,
    textAlign: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: 35,
    marginBottom: 10,
    color: '#aaa',
  },
  input: {
    borderRadius: 20,
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    elevation: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  saveButton: {
    borderRadius: 20,
    margin: 15,
    padding: 10,
    backgroundColor: '#28a745',
    elevation: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  passwordButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  passwordButtonText: {
    color: '#1379CD',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    borderRadius: 20,
    margin: 15,
    padding: 10,
    elevation: 10,
    alignItems: 'center',
  },
  infoUser: {
    top: 120,
    bottom: 20,
    padding: 15,
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    alignItems: 'center',
  },
  info: {
    fontSize: 14,
    color: '#495057',
    fontWeight: 'bold',
    marginVertical: 2,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    alignSelf: 'center',
  },
});

export default ParametreScreen;

