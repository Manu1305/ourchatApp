import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';

const AddPostScreen = ({navigation}) => {
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  // Function to pick an image from the gallery
  const pickImage = () => {
    console.log('Picking an image...');
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      console.log('Response from image picker:', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  // Function to create a new post
  const addNewPost = async () => {
    if (!caption) {
      Alert.alert('Please enter a caption');
      return;
    }

    const token = await AsyncStorage.getItem('accessToken');
    setLoading(true); // Set loading to true

    try {
      const formData = new FormData();
      formData.append('caption', caption);
      if (imageUri) {
        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('image', {
          uri: imageUri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const response = await fetch(
        'http://192.168.0.9:7000/api/v1/app/posts/addpost',
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

      const result = await response.json();
      if (result.success) {
        Alert.alert('Post created successfully!');
        navigation.goBack(); // Navigate back to the previous screen
      } else {
        Alert.alert('Failed to create post: ' + result.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('An error occurred while creating the post');
    } finally {
      setLoading(false); // Set loading to false after API call
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Post</Text>
      <TextInput
        style={styles.input}
        placeholder="Caption..."
        value={caption}
        onChangeText={setCaption}
        multiline
      />
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>Pick an Image</Text>
        )}
      </TouchableOpacity>
      <Button title="Add Post" onPress={addNewPost} />

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff69b4" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffe4e1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 20,
  },
  input: {
    height: 100,
    borderColor: '#ff69b4',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  imagePicker: {
    borderColor: '#ff69b4',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePlaceholder: {
    color: '#888',
    fontSize: 18,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddPostScreen;
