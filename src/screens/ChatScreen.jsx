import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {io} from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const ChatScreen = ({route, navigation}) => {
  const {chatId, token} = route.params;
  const [messages, setMessages] = useState([]);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const flatListRef = useRef(null);
  const socket = useRef(null);

  const fetchMessages = async (skip = 0, limit = 20) => {
    try {
      const response = await fetch(
        `http://192.168.0.9:7000/api/v1/app/chat/${chatId}/${skip}/${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'CuQvyhZDEhmvKdvdZmIrKgNbsmFjHQxhRKjWCvvQ',
            'x-app-version': '1.0.1',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        console.error(
          'Unauthorized access - maybe the token is expired or invalid.',
        );
        return;
      }

      const data = await response.json();
      if (data.success) {
        setReceiverInfo(data.data.receiverInfo);
        setMessages(data.data.allChats.reverse() || []);
      } else {
        console.error('Error fetching messages:', data.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  useEffect(() => {
    const initialize = async () => {
      const storedUserId = await AsyncStorage.getItem('_id');
      setUserId(storedUserId);
      fetchMessages();

      socket.current = io('http://192.168.0.9:7000', {
        query: {userId: storedUserId},
      });

      socket.current.on('connect', () => {
        console.log('Socket connected:', socket.current.id);
      });

      socket.current.on('newMessage', message => {
        setMessages(prevMessages => [...prevMessages, message]);
      });
    };

    initialize();

    return () => {
      socket.current.disconnect();
    };
  }, [chatId]);

  const handleSend = () => {
    if (newMessage.trim() && userId) {
      const message = {
        senderId: userId,
        receiverId: receiverInfo.id,
        message: newMessage,
        isMedia: false,
        file: [],
        chatId:chatId
      };

      socket.current.emit('sendMessage', message);
      setNewMessage('');
      setMessages(prevMessages => [
        ...prevMessages,
        {...message, sender: 'You'},
      ]);
    }
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const renderItem = ({item}) => (
    <View
      style={[
        styles.messageBubble,
        item.receiverId._id === userId
          ? styles.receivedMessage
          : styles.myMessage,
      ]}>
      <View style={styles.messageContent}>
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#f8f8f8', '#e0e0e0']} style={styles.container}>
      <View style={styles.header}>
        {receiverInfo && (
          <>
            <Text style={styles.username}>{receiverInfo.fullName}</Text>
            <Text style={styles.onlineStatus}>
              {receiverInfo.onlineStatus ? 'Online' : 'Offline'}
            </Text>
          </>
        )}
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => (item._id ? item._id : index.toString())}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current.scrollToEnd({animated: true})
        }
        onLayout={() => flatListRef.current.scrollToEnd({animated: true})}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type something ....."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d5006d',
  },
  onlineStatus: {
    fontSize: 16,
    color: '#999',
  },
  messageList: {
    paddingBottom: 60,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
    borderRadius: 20,
    padding: 10,
    maxWidth: '75%',
  },
  receivedMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  myMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#d5006d',
  },
  messageContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    padding: 5,
    borderRadius: 10,
  },
  timestamp: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#d5006d',
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#d5006d',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#d5006d',
    borderRadius: 5,
    padding: 10,
  },
  sendButtonText: {
    color: '#fff',
  },
});

export default ChatScreen;
