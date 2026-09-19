import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, BackHandler, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BASE_URL from './config/config';
import { router } from 'expo-router';

const API_URL = `${BASE_URL}/api/Adminchat/`;

const AdminMessageScreen = () => {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const route = useRoute();
  const { selectedItem } = route.params;
  const propr_prenif = selectedItem?.propr_prenif;

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}?prenif=${propr_prenif}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {}
  }, [propr_prenif]);

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
      fetchMessages();
    }, [fetchMessages])
  );

  const sendMessage = async () => {
    if (message.trim()) {
      const newMessage = { reponse: message };

      try {
        const response = await fetch(`${API_URL}?prenif=${propr_prenif}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessage),
        });

        if (response.ok) {
          const savedMessage = await response.json();
          setMessages([savedMessage, ...messages]);
          setMessage('');
          fetchMessages();
        } else {}
      } catch (error) {
      }
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }) => {
    if (!item.question && !item.reponse) return null;

    return (
      <View style={styles.messageWrapper}>
        <Text style={styles.dateText}>
          {item.date_question ? formatDateTime(item.date_question) : 'Date inconnue'}
        </Text>
        {item.question && (
          <View style={styles.messageContainerReponse}>
            <Text style={styles.messageReponse}>{item.question}</Text>
          </View>
        )}
        {item.reponse && (
          <View style={styles.messageContainerQuestion}>
            <Text style={styles.messageText}>{item.reponse}</Text>
          </View>
        )}
      </View>
    );
  };

  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        inverted
        style={styles.chatList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Tapez un message..."
          style={styles.input}
          multiline
        />
        {message.trim() !== '' && (
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity onPress={() => router.push('/AdminBarreView')} style={styles.buttonRetour}>
        <Text style={styles.buttonRetourText}>Retour</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  chatList: {
    padding: 10,
  },
  messageWrapper: {
    marginBottom: 15,
  },
  messageContainerQuestion: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    borderRadius: 20,
    maxWidth: '80%',
    padding: 10,
  },
  messageContainerReponse: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 20,
    maxWidth: '80%',
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  messageReponse: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
    marginRight: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRetourText: {
    color: 'white',
  },
  buttonRetour: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#1379CD',
    padding: 10,
    borderRadius: 20,
    elevation: 10,
  },
});

export default AdminMessageScreen;
