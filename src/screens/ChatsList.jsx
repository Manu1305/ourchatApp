import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {io} from 'socket.io-client';

const ChatList = () => {
  const [chatData, setChatData] = useState([]);
  const navigation = useNavigation();
  let socket;

  const fetchChatListFromLocalStorage = async () => {
    try {
      const storedChatData = await AsyncStorage.getItem('chatList');
      if (storedChatData) {
        setChatData(JSON.parse(storedChatData));
      }
    } catch (error) {
      console.error('Error retrieving chat data from local storage:', error);
    }
  };

  const saveChatListToLocalStorage = async chatList => {
    try {
      await AsyncStorage.setItem('chatList', JSON.stringify(chatList));
    } catch (error) {
      console.error('Error saving chat data to local storage:', error);
    }
  };

  const fetchChatList = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      navigation.navigate('Login');
    } else {
      const userId = await AsyncStorage.getItem('_id');
      console.log('Retrieved userId:', userId);
      if (userId) {
        socket = io('http://192.168.0.9:7000', {
          query: {userId: userId},
        });
        const onConnect = () => {
          console.log('Socket connected:', socket.id);
          socket.emit('requestChatList', {userId});
        };
        socket.on('connect', onConnect);
        socket.on('connect_error', error => {
          console.error('Socket connection error:', error);
        });
        socket.on('chatList', async response => {
          console.log('Chat List Response:', response);
          if (response.status) {
            if (JSON.stringify(response.data) !== JSON.stringify(chatData)) {
              setChatData(response.data);
              await saveChatListToLocalStorage(response.data);
            }
          } else {
            console.error('No chat data available or status is false.');
          }
        });
        socket.on('error', error => {
          console.error('Error from server:', error);
        });
      } else {
        console.error('User ID is null');
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchChatListFromLocalStorage();
      fetchChatList();

      return () => {
        if (socket) {
          socket.off('connect');
          socket.off('chatList');
          socket.off('error');
          socket.disconnect();
          console.log('Socket disconnected');
        }
      };
    }, [navigation]),
  );

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={async () => {
        const token = await AsyncStorage.getItem('accessToken');
        console.log(token, 'tokennn');
        console.log(item.chatId, 'chatid in chatlist');
        navigation.navigate('ChatScreen', {chatId: item.chatId, token});
      }}>
      <View style={styles.chatDetails}>
        <Text style={styles.name}>{item.fullName}</Text>
        <Text style={styles.lastMessage}>{item.latestMessage}</Text>
      </View>
      <Text style={styles.timestamp}>
        {new Date(item.lastChatOn).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat List</Text>
      {chatData.length === 0 ? (
        <Text style={styles.emptyMessage}>No chats available.</Text>
      ) : (
        <FlatList
          data={chatData}
          renderItem={renderItem}
          keyExtractor={item => item._id}
        />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Profile')}>
          <Image
            source={require('../assets/love-letter.png')}
            style={styles.icon}
          />
          <Text style={styles.navText}>memories</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('ChatList')}>
          <Image source={require('../assets/chat.png')} style={styles.icon} />
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Profile')}>
          <Image source={require('../assets/user.png')} style={styles.icon} />
          <Text style={styles.navText}>profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffe6f2',
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
    textAlign: 'center',
    color: '#d5006d',
  },
  chatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d5006d',
  },
  chatDetails: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 16,
    color: '#555',
  },
  timestamp: {
    fontSize: 14,
    color: '#aaa',
    alignSelf: 'flex-start',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 18,
    color: '#555',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#d5006d',
  },
  navButton: {
    alignItems: 'center',
  },
  icon: {
    width: 28,
    height: 28,
  },
  navText: {
    fontSize: 12,
    color: '#ff69b4',
    marginTop: 4,
  },
});

export default ChatList;
