import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router, Stack, useFocusEffect } from 'expo-router';
import { useBackHandler } from '@react-native-community/hooks';
import BASE_URL from './config/config';

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [numero, setNumero] = useState('');
  const [cin, setCIN] = useState('');
  const [modalVisible, setModalVisible] = useState(false); // Contrôle de la visibilité du modal
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoadingVerify, setIsLoadingVerify] = useState(false); // Loader pour "Vérifier"
  const [isLoadingConfirm, setIsLoadingConfirm] = useState(false); // Loader pour "Confirmer"

  useBackHandler(() => {
    router.push('/log_in');
    return true;
  });

  // Réinitialiser les champs à chaque fois que l'écran est actif
  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setNumero('');
      setCIN('');
      setNewPassword('');
      setConfirmPassword('');
    }, [])
  );


  // Fonction pour vérifier la force du mot de passe
  const isStrongPassword = (password) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleVerify = async () => {
    if (!cin || !email || !numero) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setIsLoadingVerify(true); // Active le loader pour "Vérifier"

    try {
      const response = await fetch(`${BASE_URL}/api/verify-user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cin,
          email,
          numero,
        }),
      });

      const result = await response.json();

      if (response.status === 200) {
        setModalVisible(true); // Afficher le modal pour modifier le mot de passe
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setIsLoadingVerify(false); // Désactive le loader
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    if (!isStrongPassword(newPassword)) {
      Alert.alert(
        'Mot de passe faible',
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.'
      );
      return;
    }
    
    setIsLoadingConfirm(true); // Active le loader pour "Confirmer"

    try {
      const response = await fetch(`${BASE_URL}/api/update-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cin,
          newPassword,
        }),
      });

      const result = await response.json();

      if (response.status === 200) {
        setModalVisible(false); // Fermer le modal après la mise à jour
        router.push('/log_in'); // Rediriger l'utilisateur vers l'écran de connexion
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setIsLoadingConfirm(false); // Désactive le loader
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerTransparent: true,
            headerTitle: '',
          }}
        />
        <TouchableOpacity onPress={() => router.push('/log_in')} style={styles.buttonRetour}>
          <Text style={styles.buttonRetourText}>Retour</Text>
        </TouchableOpacity>
        <View style={styles.inscription}>
          <Text style={styles.titre}>Mot de passe oublié</Text>
        </View>
        <Text style={styles.label}>C.I.N</Text>
        <TextInput
          style={styles.input}
          onChangeText={setCIN}
          value={cin}
          keyboardType="number-pad"
          autoCapitalize="none"
          placeholder="999 999 999 999"
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="exemple@gmail.com"
        />
        <Text style={styles.label}>Numéro téléphone</Text>
        <TextInput
          style={styles.input}
          onChangeText={setNumero}
          value={numero}
          keyboardType="number-pad"
          autoCapitalize="none"
          placeholder="Téléphone"
        />
        <TouchableOpacity style={styles.buttonInscrire} onPress={handleVerify} disabled={isLoadingVerify}>
          {isLoadingVerify ? <ActivityIndicator color="#000" /> : <Text style={styles.text}>Vérifier</Text>}
        </TouchableOpacity>

        {/* Modal pour changer le mot de passe */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(true)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Changer le mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="Nouveau mot de passe"
                secureTextEntry
                onChangeText={setNewPassword}
                value={newPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                secureTextEntry
                onChangeText={setConfirmPassword}
                value={confirmPassword}
              />
              <TouchableOpacity style={styles.buttonConnexion} onPress={handlePasswordChange} disabled={isLoadingConfirm}>
                {isLoadingConfirm ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonRetourText}>Confirmer</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                style={styles.buttonFermer}
              >
                <Text style={styles.buttonRetourText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 50,
  },
  inscription: {
    marginTop: 155,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  input: {
    borderRadius: 20,
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingHorizontal: 20,
    elevation: 10,
  },
  titre: {
    marginBottom: 50,
    fontSize: 30,
    fontWeight: 'bold',
  },
  buttonInscrire: {
    textAlign: 'center',
    width: 200,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 20,
    margin: 15,
    marginTop: 40,
    padding: 10,
    color: 'black',
    backgroundColor: 'white',
    elevation: 10,
  },
  buttonRetour: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#1379CD',
    padding: 10,
    marginTop: 30,
    borderRadius: 20,
    elevation: 10,
  },
  buttonRetourText: {
    color: 'white',
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cancelText: {
    color: 'red',
    marginTop: 10,
  },
  buttonConnexion: {
    width: 200,
    borderRadius: 20,
    margin: 15,
    marginTop: 30,
    padding: 10,
    backgroundColor: '#1379CD',
    elevation: 10,
  },
  buttonFermer: {
    width: 200,
    borderRadius: 20,
    margin: 15,
    padding: 10,
    backgroundColor: 'red',
    elevation: 10,
  },
});

export default SignupScreen;
