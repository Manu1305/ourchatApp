import React, {useState} from 'react';
import {
  View,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cameraIcon = require('../assets/camera.png'); // Adjust the path based on where your PNG is

const CreateChatGroup = ({navigation}) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false); // State for loading
  const [responseMessage, setResponseMessage] = useState(''); // State for response message
  const [isGroupCreated, setIsGroupCreated] = useState(false); // State to track if group is created

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
    });
    if (result.assets) {
      setProfilePic(result.assets[0]);
    }
  };

  const createGroup = async () => {
    const token = await AsyncStorage.getItem('accessToken');

    // Create FormData object to send the data
    const formData = new FormData();
    formData.append('chatName', groupName);
    formData.append('description', groupDescription);

    // Append image only if it exists
    if (profilePic) {
      formData.append('files', {
        uri: profilePic.uri,
        type: profilePic.type, // You might need to adjust this based on the file type
        name: profilePic.fileName || 'photo.jpg', // Default filename if not provided
      });
    }

    setLoading(true); // Set loading to true before the API call

    try {
      const response = await fetch(
        'http://192.168.0.9:7000/api/v1/app/chat/creategroup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': 'CuQvyhZDEhmvKdvdZmIrKgNbsmFjHQxhRKjWCvvQ',
            'x-app-version': '1.0.1',
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();
      if (response.ok) {
        // Handle successful group creation
        console.log('Group created successfully', data);
        setResponseMessage(data.message); // Set the response message
        setIsGroupCreated(true); // Update state to indicate group creation
        // Navigate back after a short delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        // Handle error
        console.log('Error creating group', data);
        setResponseMessage(data.message); // Set the response message for error
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage('An error occurred. Please try again.'); // Set a generic error message
    } finally {
      setLoading(false); // Set loading to false after the API call
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create a Romantic Chat Group</Text>

      {/* Profile Pic Section */}
      <TouchableOpacity onPress={pickImage} style={styles.profilePicContainer}>
        {profilePic ? (
          <Image source={{uri: profilePic.uri}} style={styles.profilePic} />
        ) : (
          <Image source={cameraIcon} style={styles.cameraIcon} />
        )}
      </TouchableOpacity>
      <Text style={styles.tip}>
        Upload a picture that reflects your love story (optional)
      </Text>

      {/* Group Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your group name... 'Forever in Love'"
        placeholderTextColor="#ffcdd2"
        value={groupName}
        onChangeText={setGroupName}
      />

      {/* Group Description Input */}
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Tell the story of your love, add a quote..."
        placeholderTextColor="#ffcdd2"
        value={groupDescription}
        onChangeText={setGroupDescription}
        multiline
      />

      {/* Loading Indicator */}
      {loading ? (
        <ActivityIndicator size="large" color="#ff6f91" style={styles.loader} />
      ) : !isGroupCreated ? ( // Only show button if group is not created
        <TouchableOpacity
          style={styles.createButton}
          onPress={createGroup}
          disabled={loading}>
          <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>
      ) : null}

      {/* Response Message */}
      {responseMessage ? (
        <Text style={styles.responseMessage}>{responseMessage}</Text>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffe4e1', // Romantic soft pink
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'DancingScript-Regular',
    color: '#ff6f91',
    marginVertical: 20,
  },
  profilePicContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffc1e3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  cameraIcon: {
    width: 50, // Adjust size as needed
    height: 50,
  },
  tip: {
    color: '#ff6f91',
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#ff869a',
    borderRadius: 15,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#ff6f91',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
    width: '80%',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  loader: {
    marginTop: 20,
  },
  responseMessage: {
    marginTop: 20,
    color: '#ff6f91',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CreateChatGroup;
