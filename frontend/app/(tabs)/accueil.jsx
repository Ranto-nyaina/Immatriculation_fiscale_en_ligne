import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  BackHandler,
  TouchableOpacity,
  Modal,
  Button,
  ScrollView,
} from 'react-native';
import BASE_URL from './config/config';
import * as SecureStore from 'expo-secure-store';

const HomeScreen = () => {
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [shuffledOptions, setShuffledOptions] = useState({});

  // Fetch data from the API
  useEffect(() => {
    const loadCivismeFiscal = async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');

        if (!token) {
          console.log('Aucun token trouvé');
          setData([]);
          return;
        }

        const response = await fetch(`${BASE_URL}/api/civisme_fiscale/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await response.json();

        console.log('Réponse civisme fiscal :', json);

        if (!response.ok) {
          console.log('Erreur API civisme fiscal :', response.status);
          setData([]);
          return;
        }

        // L'API doit retourner un tableau
        if (Array.isArray(json)) {
          setData(json);
        } else if (Array.isArray(json.results)) {
          // Supporte aussi une réponse paginée DRF
          setData(json.results);
        } else {
          console.log('Format inattendu de la réponse :', json);
          setData([]);
        }
      } catch (error) {
        console.log('Erreur civisme fiscal :', error);
        setData([]);
      }
    };

    loadCivismeFiscal();

    // Handle the back button to exit the app
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productBox}
      onPress={() => {
        setSelectedItem(item);
        setModalVisible(true);
        setSelectedAnswer(null);
        setQuizResult('');
        setAnsweredQuestions([]);
        setShuffledOptions({});
      }}
    >
      <Text style={styles.productTitle}>
        Description: {item.description}
      </Text>

      <Text>Question: {item.question}</Text>

    </TouchableOpacity>
  );

  const handleAnswerSelection = (correctAnswer, answer, questionIndex) => {
    if (answeredQuestions.includes(questionIndex)) return;

    setAnsweredQuestions([...answeredQuestions, questionIndex]);
    setSelectedAnswer(correctAnswer);

    if (correctAnswer === answer) {
      setQuizResult('Correct!');
    } else {
      setQuizResult(`Incorrect! La bonne réponse est: ${answer}`);
    }
  };

  const shuffleOptions = (options) => {
    if (!Array.isArray(options)) {
      return [];
    }

    const shuffled = [...options];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  };

  const renderQuiz = (quizz) => {
    if (!quizz) {
      return <Text>Aucun quiz disponible</Text>;
    }

    let parsedQuizz;

    try {
      parsedQuizz =
        typeof quizz === 'string'
          ? JSON.parse(quizz)
          : quizz;
    } catch (error) {
      console.log('Erreur parsing du quiz :', error);
      return <Text>Quiz invalide</Text>;
    }

    // Vérification importante pour éviter .map() sur undefined
    if (
      !parsedQuizz ||
      !Array.isArray(parsedQuizz.questions)
    ) {
      return <Text>Aucune question disponible</Text>;
    }

    return (
      <View>
        <Text style={styles.quizTitle}>
          {parsedQuizz.quiz_title || 'Quiz'}
        </Text>

        {parsedQuizz.questions.map((q, index) => {
          // Vérification des données de la question
          if (!q || !Array.isArray(q.options)) {
            return (
              <View key={index} style={styles.quizItem}>
                <Text style={styles.quizQuestion}>
                  {index + 1}. {q?.q || 'Question indisponible'}
                </Text>

                <Text>Aucune option disponible</Text>
              </View>
            );
          }

          // Si les options n'ont pas encore été mélangées,
          // utiliser directement les options originales.
          const options =
            shuffledOptions[index] || q.options;

          return (
            <View key={index} style={styles.quizItem}>
              <Text style={styles.quizQuestion}>
                {index + 1}. {q.q}
              </Text>

              <View style={styles.quizOptions}>
                {options.map((option, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.quizOption,
                      selectedAnswer && {
                        backgroundColor:
                          option === selectedAnswer
                            ? option === q.answer
                              ? 'green'
                              : 'red'
                            : 'transparent',
                      },
                    ]}
                    onPress={() =>
                      handleAnswerSelection(
                        option,
                        q.answer,
                        index
                      )
                    }
                  >
                    <Text>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item?.id
            ? item.id.toString()
            : index.toString()
        }
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {selectedItem && (
              <ScrollView>
                <Text style={styles.modalText}>
                  Quiz
                </Text>

                {renderQuiz(selectedItem.quizz)}

                {selectedAnswer && (
                  <Text style={styles.quizResult}>
                    {quizResult}
                  </Text>
                )}
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              <Button
                title="Fermer"
                onPress={() => setModalVisible(false)}
                color="#007bff"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
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
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 15,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 35,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 10,
  },
  quizItem: {
    marginBottom: 10,
  },
  quizQuestion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  quizOptions: {
    marginTop: 5,
  },
  quizOption: {
    fontSize: 14,
    color: '#555',
    padding: 10,
    borderWidth: 1,
    marginBottom: 5,
    borderRadius: 5,
  },
  quizResult: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
    width: '100%',
  },
});

export default HomeScreen;