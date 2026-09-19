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
const HomeScreen = () => {
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [shuffledOptions, setShuffledOptions] = useState({});

  useEffect(() => {
    // Fetch data from the API
    fetch(`${BASE_URL}/api/civisme_fiscale/`)
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch();

    // Handle the back button to exit the app
    const backAction = () => {
      BackHandler.exitApp();
      return true; // Prevent default back navigation
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    // Clean up the event listener on component unmount
    return () => backHandler.remove();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productBox}
      onPress={() => {
        setSelectedItem(item);
        setModalVisible(true);
        setSelectedAnswer(null); // Reset selected answer
        setQuizResult(''); // Reset quiz result
        setAnsweredQuestions([]); // Reset answered questions
        setShuffledOptions({}); // Reset shuffled options
      }}
    >
      <Text style={styles.productTitle}>Description: {item.description}</Text>
      <Text>Question: {item.question}</Text>
      <Text>Réponse: {item.reponse}</Text>
    </TouchableOpacity>
  );

  const handleAnswerSelection = (correctAnswer, answer, questionIndex) => {
    if (answeredQuestions.includes(questionIndex)) return; // Don't allow multiple answers

    setAnsweredQuestions([...answeredQuestions, questionIndex]);
    setSelectedAnswer(correctAnswer);
    if (correctAnswer === answer) {
      setQuizResult('Correct!');
    } else {
      setQuizResult(`Incorrect! La bonne réponse est: ${answer}`);
    }
  };

  const shuffleOptions = (options) => {
    const shuffled = [...options]; // Create a copy of the options
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
  };

  const renderQuiz = (quizz) => {
    if (!quizz) return <Text>Aucun quiz disponible</Text>;

    const parsedQuizz = typeof quizz === 'string' ? JSON.parse(quizz) : quizz;

    return (
      <View>
        <Text style={styles.quizTitle}>{parsedQuizz.quiz_title}</Text>
        {parsedQuizz.questions.map((q, index) => {
          // Check if options have already been shuffled for this question
          if (!shuffledOptions[index]) {
            setShuffledOptions((prevOptions) => ({
              ...prevOptions,
              [index]: shuffleOptions(q.options), // Shuffle options once
            }));
          }

          const options = shuffledOptions[index] || q.options; // Use shuffled or original options

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
                        backgroundColor: option === selectedAnswer
                          ? option === q.answer
                            ? 'green'
                            : 'red'
                          : 'transparent',
                      },
                    ]}
                    onPress={() => handleAnswerSelection(option, q.answer, index)}
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
        keyExtractor={(item) => item.id.toString()}
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
                <Text style={styles.modalText}>Quiz</Text>
                {renderQuiz(selectedItem.quizz)}
                {selectedAnswer && (
                  <Text style={styles.quizResult}>{quizResult}</Text>
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
