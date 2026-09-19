import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import { useBackHandler } from '@react-native-community/hooks';
import BASE_URL from './config/config';

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [numero, setNumero] = useState('');
  const [cin, setCIN] = useState('');
  const [sexe, setSexe] = useState('');
  const [situation, setSituation] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastName] = useState('');
  const [date, setDate] = useState(new Date());
  const [lieuDeNaiss, setLieuDeNaiss] = useState('');
  const [adress, setAdress] = useState('');
  const [activite, setActivite] = useState('');
  const [lieuDeDeliv, setLieuDeDeliv] = useState('');
  const [dateDeliv, setDateDeliv] = useState(new Date());
  const [showDate, setShowDate] = useState(false); 
  const [showDeliv, setShowDeliv] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [isMaleChecked, setIsMaleChecked] = useState(false);
  const [isFemaleChecked, setIsFemaleChecked] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const scrollViewRef = useRef(null);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  const toggleMaleCheckbox = () => {
    setIsMaleChecked(!isMaleChecked);
    setIsFemaleChecked(false);
    setSexe('Homme');
  };

  useBackHandler(() => {
    router.push('/log_in');
    return true; 
  });


  const toggleFemaleCheckbox = () => {
    setIsFemaleChecked(!isFemaleChecked);
    setIsMaleChecked(false);
    setSexe('Femme');
  };

  const isStrongPassword = (password) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleSignup = async () => {
    if (!email || !password || !name || !lastname) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
        return;
    }
    
    if (!isStrongPassword(password)) {
      Alert.alert(
        'Mot de passe faible',
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.'
      );
      return;
    }
    setIsLoading(true);
    const sexeId = sexe === 'Homme' ? 1 : sexe === 'Femme' ? 2 : null; 
    const situationId = situation === 'Célibataire' ? 1 : situation === 'Marié(e)' ? 2 : situation === 'Divorcé(e)' ? 3 : situation === 'Veuf(ve)' ? 4 : null; 

    try {
        const response = await fetch(`${BASE_URL}/api/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                propr_name: name, 
                last_name: lastname, 
                sexe: sexeId, 
                birth_date: date.toISOString().split('T')[0], 
                birth_place: lieuDeNaiss, 
                sit_matrim: situationId, 
                propr_cin: cin, 
                delivr_cin_date: dateDeliv.toISOString().split('T')[0], 
                cin_place: lieuDeDeliv, 
                propr_contact: numero, 
                mailing_address: email, 
            }),
        });

        const data = await response.json();

        if (response.status === 201) {
          Alert.alert('Info', 'Votre nom dans l\'operateur est: '+data.user.propr_name+ ' ' + data.user.last_name + ' et vous porte le PRENIF: '+ data.user.propr_prenif);
          router.push('/drawer');
        } else {
          if (response.status === 400) {
            Alert.alert('Erreur', 'Le mot de passe est invalide. Il doit contenir au moins 8 caractères et forte.');
          } else {
            Alert.alert('Erreur', data.message ||'Une erreur est survenue.');
          }

      }
    } catch (error) {
        Alert.alert('Erreur', 'CIN invalide.');
    }
    finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text style={styles.stepTitle}>Étape 1: Informations personnelles</Text>
            <Text style={styles.label}>Nom</Text>
            <TextInput style={styles.input} onChangeText={setName} value={name} placeholder='Nom' />
            <Text style={styles.label}>Prenom</Text>
            <TextInput style={styles.input} onChangeText={setLastName} value={lastname} placeholder='Prenom' />
            <Text style={styles.label}>Sexe</Text>
            <View style={styles.checkboxStyle}>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity style={styles.checkbox} onPress={toggleMaleCheckbox}>
                  <View style={isMaleChecked ? styles.checked : styles.unchecked} />
                </TouchableOpacity>
                <Text> Homme</Text>
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity style={styles.checkbox} onPress={toggleFemaleCheckbox}>
                  <View style={isFemaleChecked ? styles.checked : styles.unchecked} />
                </TouchableOpacity>
                <Text> Femme</Text>
              </View>
            </View>
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.stepTitle}>Étape 2: Informations supplémentaires</Text>
            <Text style={styles.label}>Situation matrimoniale :</Text>
            <View style={styles.listeDeroullante}>
              <RNPickerSelect
                onValueChange={(value) => setSituation(value)} 
                items={[
                  { label: 'Célibataire', value: 'Célibataire' },
                  { label: 'Marié(e)', value: 'Marié(e)' },
                  { label: 'Divorcé(e)', value: 'Divorcé(e)' },
                  { label: 'Veuf(ve)', value: 'Veuf(ve)' },
                ]}
                placeholder={{ label: "Situation", value: null }} 
              />
            </View>
            <Text style={styles.label}>Date de naissance</Text>
            <TouchableOpacity onPress={() => setShowDate(true)} style={styles.input}>
              <Text style={styles.textDate}>{date.toDateString()}</Text>
            </TouchableOpacity>
            {showDate && (
              <DateTimePicker value={date} mode="date" display="default" onChange={(e, selectedDate) => {
                setShowDate(false);
                setDate(selectedDate || date);
              }} />
            )}
            <Text style={styles.label}>Lieu de naissance</Text>
            <TextInput style={styles.input} onChangeText={setLieuDeNaiss} value={lieuDeNaiss} placeholder='Lieu de naissance' />
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.stepTitle}>Étape 3: Informations d'identité</Text>
            <Text style={styles.label}>C.I.N</Text>
            <TextInput style={styles.input} onChangeText={setCIN} value={cin} keyboardType="number-pad" placeholder='999 999 999 999' />
            <Text style={styles.label}>Date de délivrance</Text>
            <TouchableOpacity onPress={() => setShowDeliv(true)} style={styles.input}>
              <Text style={styles.textDate}>{dateDeliv.toDateString()}</Text>
            </TouchableOpacity>
            {showDeliv && (
              <DateTimePicker value={dateDeliv} mode="date" display="default" onChange={(e, selectedDate) => {
                setShowDeliv(false);
                setDateDeliv(selectedDate || dateDeliv);
              }} />
            )}
            <Text style={styles.label}>Lieu de délivrance</Text>
            <TextInput style={styles.input} onChangeText={setLieuDeDeliv} value={lieuDeDeliv} placeholder='Lieu de délivrance' />
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.stepTitle}>Étape 4: Informations de contact</Text>
            <Text style={styles.label}>Adresse</Text>
            <TextInput style={styles.input} onChangeText={setAdress} value={adress} placeholder='Adresse' />
            <Text style={styles.label}>Activité</Text>
            <TextInput style={styles.input} onChangeText={setActivite} value={activite} placeholder='Votre activité' />
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} onChangeText={setEmail} value={email} keyboardType="email-address" placeholder='exemple@gmail.com' />
            <Text style={styles.label}>Numero téléphone</Text>
            <TextInput style={styles.input} onChangeText={setNumero} value={numero} keyboardType="number-pad" placeholder='Telephone' />
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput style={styles.input} onChangeText={setPassword} value={password} 
              secureTextEntry={!isPasswordVisible} placeholder='****' />
            <View style={styles.checkboxContainer}>
              <TouchableOpacity style={styles.checkbox} onPress={togglePasswordVisibility}>
                <View style={isPasswordVisible ? styles.checked : styles.unchecked} />
              </TouchableOpacity>
              <Text> Afficher le mot de passe</Text>
            </View>
          </>
        );
    }
  };

  return (
    <ScrollView ref={scrollViewRef}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerTransparent: true, headerTitle: "" }} />

        <TouchableOpacity onPress={() => router.push('/log_in')} style={styles.buttonRetour}>
          <Text style={styles.buttonRetourText}>Retour</Text>
        </TouchableOpacity>
        <View style={styles.inscription}>
          <Text style={styles.titre}>S'inscription</Text>
        </View>

        {renderStep()}

        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity onPress={prevStep} style={styles.navButton}>
              <Text style={styles.navButtonText}>Précédent</Text>
            </TouchableOpacity>
          )}
          {currentStep < 4 ? (
            <TouchableOpacity onPress={nextStep} style={styles.navButton}>
              <Text style={styles.navButtonText}>Suivant</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleSignup} style={styles.buttonInscrire} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#1379CD" />
              ) : (
                <Text style={styles.text}>S'inscrire</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
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
  listeDeroullante: {
    justifyContent: 'center',
    borderRadius: 20,
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 20,
    elevation: 10,
  },
  titre: {
    marginBottom: 50,
    fontSize: 30,
    fontWeight: 'bold',
  },
  buttonInscrire: {
    textAlign: 'center',
    width: 180,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 20,
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
  },
  text: {
    textAlign: 'center',
  },
  textDate: {
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginRight: 30,
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
  checkboxStyle:{
    flexDirection: 'row',  
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
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f44336',
    borderRadius: 20,
    elevation: 10,
  },
  closeText: {
    color: 'white',
  },
  resultContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#1379CD',
    padding: 10,
    borderRadius: 20,
    width: '45%',
  },
  navButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default SignupScreen;

