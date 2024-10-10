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
import placeholderImage from '../assets/love-letter.png';

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
      if (userId) {
        socket = io('http://192.168.0.9:7000', {
          query: {userId: userId},
        });
        socket.on('connect', () => {
          socket.emit('requestChatList', {userId});
        });
        socket.on('chatList', async response => {
          if (response.status) {
            const uniqueChatData = response.data.reduce((acc, current) => {
              const x = acc.find(item => item.chatId === current.chatId);
              if (!x) {
                return acc.concat([current]);
              } else {
                return acc;
              }
            }, []);
            if (JSON.stringify(uniqueChatData) !== JSON.stringify(chatData)) {
              setChatData(uniqueChatData);
              await saveChatListToLocalStorage(uniqueChatData);
            }
          }
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
          socket.disconnect();
        }
      };
    }, [navigation]),
  );

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={async () => {
        const token = await AsyncStorage.getItem('accessToken');
        navigation.navigate('ChatScreen', {chatId: item.chatId, token});
      }}>
      <Image
        source={{
          uri:
            `https://chatapp1305.s3.eu-north-1.amazonaws.com/${item.groupProfilePicture}` ||
            placeholderImage, // Placeholder image
        }}
        style={styles.profilePicture}
      />
      <View style={styles.chatDetails}>
        <Text style={styles.name}>{item.chatName}</Text>
        <Text style={styles.lastMessage}>{item.latestMessage}</Text>
      </View>
      <Text style={styles.timestamp}>
        {new Date(item.lastChatOn).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Our Rooms</Text>
      {chatData.length === 0 ? (
        <Text style={styles.emptyMessage}>No chats available.</Text>
      ) : (
        <FlatList
          data={chatData}
          renderItem={renderItem}
          keyExtractor={item => item.chatId}
        />
      )}

      {/* Static Plus Button */}
      <TouchableOpacity
        style={styles.plusButton}
        onPress={() => navigation.navigate('Newgroup')}>
        <Image
          source={require('../assets/interior-design.png')}
          style={styles.plusIcon}
        />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('PostScreen')}>
          <Image
            source={require('../assets/love-letter.png')}
            style={styles.icon}
          />
          <Text style={styles.navText}>Memories</Text>
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
          <Text style={styles.navText}>Profile</Text>
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
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d5006d',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatDetails: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d5006d',
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
  plusButton: {
    position: 'absolute',
    bottom: 95,
    right: 20,
    backgroundColor: '#ff69b4',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  plusIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
});

export default ChatList;
