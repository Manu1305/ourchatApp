import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import {io} from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {launchImageLibrary} from 'react-native-image-picker';

const ChatScreen = ({route, navigation}) => {
  const {chatId, token, recciverId} = route.params;

  const [messages, setMessages] = useState([]);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSendingImage, setIsSendingImage] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageToEnlarge, setImageToEnlarge] = useState(null);
  const flatListRef = useRef(null);
  const socket = useRef(null);
  const [isReceiverOnline, setIsReceiverOnline] = useState(false); 
  const [lastSeen, setLastSeen] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [wallpaper, setWallpaper] = useState(null);
  const [inChatScreen, setInchatScreen] = useState(false);
const [chatInfoData,setChatInfo]=useState(null)
  const messageSeen = async () => {
    try {
      const response = await fetch(
        `http://192.168.0.9:7000/api/v1/app/chat/${chatId}`,
        {
          method: 'PATCH',
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
      console.log('message seen api success');
    } catch (error) {
      console.log(error, 'error happened');
    }
  };
 const handleWallpaperChange = async () => {
   const result = await launchImageLibrary({mediaType: 'photo'});

   if (!result.canceled) {
     const formData = new FormData();
     formData.append('file', {
       uri: result.assets[0].uri,
       name: 'themeImage.jpeg',
       type: 'image/jpeg',
     });

     try {
       const response = await fetch(
         `http://192.168.0.9:7000/api/v1/app/chat/chattheme/${chatId}`,
         {
           method: 'POST',
           headers: {
             'x-api-key': 'CuQvyhZDEhmvKdvdZmIrKgNbsmFjHQxhRKjWCvvQ',
             'x-app-version': '1.0.1',
             Authorization: `Bearer ${token}`,
           },
           body: formData, // Include formData here
         },
       );

       const data = await response.json();

       if (data.success) {
         const filename = data.data.filename;
         setWallpaper(
           `https://chatapp1305.s3.eu-north-1.amazonaws.com/${filename}`,
         );
       } else {
         console.error(data.message, 'issue in upload');
       }
     } catch (error) {
       console.error('Error uploading image:', error);
     }
   }
 };


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
      console.log(data,'dataaa',data.data.chatInfo,'chatinfp')
      if (data.success) {
        setReceiverInfo(data.data.receiverInfo);
        setChatInfo(data.data.chatInfo);
        setMessages(data.data.allChats.reverse() || []);
        setIsReceiverOnline(data.data.receiverInfo.onlineStatus);
        setLastSeen(data.data.receiverInfo.lastSeen);
        setInchatScreen(data.data.receiverInfo.isInChatScreen);
        setWallpaper(
          `https://chatapp1305.s3.eu-north-1.amazonaws.com/${data.data.chatInfo.wallpaper}`,
        );
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
      messageSeen();
      fetchMessages();

      socket.current = io('http://192.168.0.9:7000', {
        query: {userId: storedUserId},
      });

      socket.current.on('connect', () => {
        console.log('Socket connected:', socket.current.id);

        socket.current.emit('online', {
          senderId: storedUserId,
          status: true,
          chatId: chatId,
        });

        socket.current.emit('iaminchatScreen', {
          senderId: storedUserId,
          receiverId: recciverId,
          status: true,
          chatId: chatId,
        });

        socket.current.on('newMessage', message => {
          console.log(message, 'message coming');
          if (message.chatId === chatId) {
            const updatedMessage = {
              ...message,
              seen: inChatScreen ? true : false, // Update seen status based on chat screen state
            };
            setMessages(prevMessages => [...prevMessages, updatedMessage]);
          }
        });

        socket.current.on('userOnline', status => {
          console.log(status, 'status');
          if (status.chatId === chatId) {
            setIsReceiverOnline(status.isOnline);
            setLastSeen(status.lastSeen);
          }
        });

        socket.current.on('chatscreen', status => {
          console.log(status, 'chatscreen status');

          if (status.chatId === chatId) {
            setInchatScreen(status.isInChatScreen);
          } else {
            console.log('Received an invalid status for chatscreen event');
          }
        });
      });
    };

    initialize();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        console.log('Socket disconnected');
      }
    };
  }, [chatId]);

  useEffect(() => {
    if (inChatScreen) {
      // Update all messages in the chat as seen when user is in chat screen
      const updateSeenStatus = async () => {
        await messageSeen(); // Make API call to update seen status
        setMessages(
          prevMessages => prevMessages.map(msg => ({...msg, seen: true})), // Update local messages state
        );
      };

      updateSeenStatus();
    }
  }, [inChatScreen]);
  const handleSend = () => {
    if (newMessage.trim() && userId) {
      const message = {
        senderId: userId,
        receiverId: receiverInfo.id,
        message: newMessage,
        isMedia: false,
        file: '',
        chatId: chatId,
        seen: inChatScreen ? true : false,
      };

      socket.current.emit('sendMessage', message);
      console.log(message, 'sending message');
      setNewMessage('');
      setMessages(prevMessages => [
        ...prevMessages,
        {...message, sender: 'You'},
      ]);
    }
  };

  const handleImagePick = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});

    if (!result.didCancel && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      setSelectedImage(selectedAsset);
    }
  };

  const handleImageSend = async () => {
    if (!selectedImage || isSendingImage) return;

    setIsSendingImage(true);

    const formData = new FormData();
    formData.append('image', {
      uri: selectedImage.uri,
      type: selectedImage.type,
      name: selectedImage.fileName,
    });

    try {
      const response = await fetch(
        'http://192.168.0.9:7000/api/v1/app/chat/sendimage',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': 'CuQvyhZDEhmvKdvdZmIrKgNbsmFjHQxhRKjWCvvQ',
            'x-app-version': '1.0.0',
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();
      if (data.success) {
        const imageUrl = data.data.filename;
        const message = {
          senderId: userId,
          receiverId: receiverInfo.id,
          message: '',
          isMedia: true,
          file: imageUrl,
          chatId: chatId,
          seen: true, // Initialize seen status
        };

        socket.current.emit('sendMessage', message);
        setMessages(prevMessages => [
          ...prevMessages,
          {...message, sender: 'You', isMedia: true, file: imageUrl},
        ]);

        setSelectedImage(null);
      } else {
        console.error('Error uploading image:', data.message);
      }
    } catch (error) {
      console.error('Error sending image:', error);
    }

    setIsSendingImage(false);
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
  const formatDateLastSeen = dateString => {
    const date = new Date(dateString);
    const today = new Date();

    // Calculate if the date is today or yesterday
    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    let formattedDate;

    if (isToday) {
      formattedDate = 'Today';
    } else if (isYesterday) {
      formattedDate = 'Yesterday';
    } else {
      formattedDate = date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }

    // Get hours and minutes
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedDate}, ${formattedHours}:${formattedMinutes} ${ampm}`;
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
        {item.isMedia ? (
          <TouchableOpacity
            onPress={() => {
              setImageToEnlarge(
                `https://chatapp1305.s3.eu-north-1.amazonaws.com/${item.file}`,
              );
              setImageModalVisible(true);
            }}>
            <Image
              source={{
                uri: `https://chatapp1305.s3.eu-north-1.amazonaws.com/${item.file}`,
              }}
              style={styles.image}
            />
          </TouchableOpacity>
        ) : (
          <Text style={styles.messageText}>{item.message}</Text>
        )}
        <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
        <View style={styles.statusContainer}>
          {item.seen  ? (
            <Image
              source={require('../assets/seen.png')}
              style={styles.statusIcon}
            />
          ) : (
            <Image
              source={require('../assets/delivered.png')}
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
    </View>
  );

const renderOnlineStatus = () => {
  if (isReceiverOnline) {
    return (
      <View style={styles.onlineStatusContainer}>
        <Image
          source={require('../assets/happy.png')} // Update the path to your GIF
          style={styles.gifStyle} // Add styles for the GIF
        />
        <Text style={styles.onlineText}> Online</Text>
      </View>
    );
  } else if (lastSeen) {
    return (
      <View style={styles.onlineStatusContainer}>
        <Image
          source={require('../assets/offline.png')} // Update the path to your GIF
          style={styles.gifStyle} // Add styles for the GIF
        />
        <Text style={styles.onlineText}> {formatDateLastSeen(lastSeen)}</Text>
      </View>
    );
  } else {
    return <Text style={styles.onlineText}> Offline</Text>;
  }
};

  return (
    <ImageBackground
      source={wallpaper ? {uri: wallpaper} : require('../assets/images.jpg')} // Use a default background image when wallpaper is not set
      style={styles.background}
      resizeMode="cover" // Optional: to make sure the background image covers the entire area
    >
      <View style={styles.header}>
        {receiverInfo && chatInfoData && (
          <>
            <Text style={styles.chatName}>{chatInfoData?.chatName}</Text>
            <Text style={styles.username}>{receiverInfo.fullName}</Text>
            <Text style={styles.onlineStatus}>{renderOnlineStatus()}</Text>
            <TouchableOpacity onPress={handleWallpaperChange}>
              <Image
                source={require('../assets/paint.png')}
                style={styles.wallpaper}
              />
            </TouchableOpacity>
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
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleImagePick}>
          <Image
            source={require('../assets/camera.png')}
            style={styles.attachmentIcon}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={handleSend}>
          <Image
            source={require('../assets/send.png')}
            style={styles.sendIcon}
          />
        </TouchableOpacity>
      </View>

      <Modal visible={imageModalVisible} transparent>
        <View style={styles.modalBackground}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setImageModalVisible(false)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
          <Image source={{uri: imageToEnlarge}} style={styles.enlargedImage} />
        </View>
      </Modal>

      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{uri: selectedImage.uri}}
            style={styles.imagePreview}
          />

          <View style={styles.actionButtonsContainer}>
            {/* Close button */}
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              style={styles.closeButton}>
              <Image
                source={require('../assets/close.png')}
                style={styles.closeIconImage}
              />
            </TouchableOpacity>

            {/* Send button */}
            <TouchableOpacity
              onPress={handleImageSend}
              disabled={isSendingImage}>
              {isSendingImage ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : (
                <Image
                  source={require('../assets/sendimage.png')}
                  style={styles.sendIconImage}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 10,
    backgroundColor: '#fff',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    right: 100,
  },
  onlineStatus: {
    fontSize: 20,
    color: 'green',
    right: 70,
  },
  messageList: {
    flexGrow: 1,
    padding: 10,
  },
  messageBubble: {
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7dd',
    borderRadius: 10,
    padding: 10,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8d7da',
    borderRadius: 10,
    padding: 10,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageText: {
    bottom: 15,
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  seenStatus: {
    fontSize: 10,
    color: 'blue',
    marginTop: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 10,
  },
  attachmentIcon: {
    width: 24,
    height: 24,
  },
  wallpaper: {
    width: 24,
    height: 24,
    left: 150,
    bottom: 40,
  },
  sendIcon: {
    width: 24,
    height: 24,
    marginLeft: 10,
  },
  sendIconImage: {
    width: 55,
    height: 55,
    marginLeft: 1,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  enlargedImage: {
    width: '90%',
    height: '80%',
    resizeMode: 'contain',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 18,
  },
  imagePreviewContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePreview: {
    width: 150,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
    marginRight: 10,
  },
  sendImageText: {
    fontSize: 16,
    color: '#007bff',
  },
  closeButton: {
    marginRight: 10,
    padding: 5,
    backgroundColor: 'red',
    borderRadius: 19,
    bottom: 30,
    left: 20,
  },
  closeIconImage: {
    width: 30,
    height: 30,
    // You can change this depending on your needs
  },
  image: {
    height: 300,
    width: 300,
  },
  background: {
    flex: 1, // This makes the background fill the entire container
    justifyContent: 'flex-start', // Adjust based on your layout preference
  },
  statusContainer: {
    flexDirection: 'row', // Align icons horizontally
    alignItems: 'center', // Center vertically
    justifyContent: 'flex-end', // Align to the right
    marginVertical: 5, // Space between messages
  },
  statusIcon: {
    width: 20, // Adjust width
    height: 20, // Adjust height
    marginLeft: 5, // Space between the message and the icon
    // Change color based on status
  },

  chatName: {
    fontSize: 32, // Adjust size as needed
    fontWeight: 'bold',
    color: '#FF1493', // A vibrant pink color
    textAlign: 'center', // Centered text
    marginBottom: 10, // Space below the chat name
    textShadowColor: '#FF69B4', // Light pink shadow for depth
    textShadowOffset: {width: 1, height: 1}, // Shadow position
    textShadowRadius: 10, // Softness of the shadow
    fontFamily: 'Cursive',
    top: 20, // Use a cursive font for romance (ensure the font is available)
    right: 150,
  },
  onlineStatusContainer: {
    flexDirection: 'row', // Align text and GIF horizontally
    alignItems: 'center', // Center align items
  },
  gifStyle: {
    width: 25, // Adjust the size of the GIF
    height: 25, // Adjust the size of the GIF
    marginRight: 5, // Space between the GIF and text
  },
  onlineText: {
    fontSize: 16, // Adjust font size as needed
    color: '#ff69b4', // Cute pink color for the text
    fontWeight: 'bold', // Make the text bold
  },
});

export default ChatScreen;
