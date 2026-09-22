import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { Link, Stack } from 'expo-router';
import { useRouter, useFocusEffect } from 'expo-router';
import BASE_URL from './config/config';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isLoadingLogin, setLoadingLogin] = useState(false);
  const [isLoadingVerification, setLoadingVerification] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  // Gérer le bouton retour pour quitter l'application
  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      backHandler.remove();
    };
  }, []);

  // Réinitialiser les champs lorsque l'écran est focalisé
  useFocusEffect(
    React.useCallback(() => {
      setEmail('');
      setPassword('');
      setVerificationCode('');
      return () => {};
    }, [])
  );

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert(
      'Erreur',
      'Veuillez remplir tous les champs.'
    );
    return;
  }

  setLoadingLogin(true);

  try {
    const response = await fetch(`${BASE_URL}/api/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setModalVisible(true);
    } else {
      Alert.alert(
        'Erreur',
        data.error || 'Email ou mot de passe incorrect.'
      );
    }
  } catch (error) {
    console.error('Erreur login:', error);

    Alert.alert(
      'Erreur',
      'Problème de connexion avec le serveur.'
    );
  } finally {
    setLoadingLogin(false);
  }
};

  const confirmCode = async () => {
    if (!verificationCode) {
      Alert.alert('Erreur', 'Veuillez entrer le code de vérification.');
      return;
    }
  
    setLoadingVerification(true); // Démarre le chargement
    try {
      const response = await fetch(`${BASE_URL}/api/verify-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });
  
      const data = await response.json(); // Convertir la réponse en JSON
  
      if (response.ok) {
        setModalVisible(false);
        setEmail('');
        setPassword('');
        setVerificationCode('');
  
        if (data.prenif === '0000000000') { // Utiliser data.prenif et non response.prenif
          router.push('/AdminBarreView');
        } else {
          router.push('/drawer');
        }
      } else {
        Alert.alert('Erreur', data.error || 'Code de vérification incorrect.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Problème de connexion avec le serveur.');
    } finally {
      setLoadingVerification(false); // Arrête le chargement
    }
  };
  

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTransparent: true, headerTitle: '' }} />
      <Image style={styles.titre} source={require('@/assets/images/LOGO_MEF.jpeg')} />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="exemple@gmail.com"
      />

      <Text style={styles.label}>Mot de passe</Text>
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        secureTextEntry={!isPasswordVisible}
        placeholder="****"
      />

      <View style={styles.checkboxContainer}>
        <TouchableOpacity style={styles.checkbox} onPress={togglePasswordVisibility}>
          <View style={isPasswordVisible ? styles.checked : styles.unchecked} />
        </TouchableOpacity>
        <Text>Afficher le mot de passe</Text>
      </View>

      <TouchableOpacity onPress={handleLogin} style={styles.buttonConnexion} disabled={isLoadingLogin}>
        {isLoadingLogin ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>Connexion</Text>}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setVerificationCode('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Vérification</Text>
            <TextInput
              style={styles.input}
              onChangeText={setVerificationCode}
              value={verificationCode}
              placeholder="Code de vérification"
            />
            <TouchableOpacity onPress={confirmCode} style={styles.buttonConnexion} disabled={isLoadingVerification}>
              {isLoadingVerification ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.text}>Confirmer le code</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setVerificationCode('');
                setEmail('');
                setPassword('');
              }}
              style={styles.buttonFermer}
            >
              <Text style={styles.text}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity onPress={() => router.replace('/sign_up')} style={styles.buttonInscrire}>
        <Text style={styles.textInscicre}>Inscription</Text>
      </TouchableOpacity>
      <Link href="/motDepasse" style={styles.buttonMdp}>
        <Text>Mot de passe oublié!</Text>
      </Link>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff'
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
    elevation: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  titre: {
    height: 150,
    width: 150,
    marginBottom: 30,
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
  text: {
    color: 'white',
    textAlign: 'center',
  },
  buttonInscrire: {
    textAlign: 'center',
    width: 200,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 20,
    marginTop: 20,
    margin: 15,
    padding: 10,
    color: 'black',
    backgroundColor: 'white',
    elevation: 10,
  },
  textInscicre: {
    textAlign: 'center',
  },
  buttonMdp: {
    color: '#1379CD',
    bottom: -140,
    padding: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 35,
  },
  buttonFermer: {
    width: 200,
    borderRadius: 20,
    margin: 15,
    padding: 10,
    backgroundColor: 'red',
    elevation: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#1379CD',
    borderRadius: 5,
    marginRight: 10,
 
  justifyContent: 'center',
  alignItems: 'center',
},
  unchecked: {
    width: 0,
    height: 0,
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: '#1379CD',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default LoginScreen;
