import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';

const EditProfilePage = ({route, navigation}) => {
  const {profile} = route.params;

  const [editableProfile, setEditableProfile] = useState({
    fullName: profile?.fullName || '',
    currentFeelingAboutPartner: profile?.currentFeelingAboutPartner || '',
    myMood: profile?.myMood || '',
    profilePicture:
      `https://chatapp1305.s3.eu-north-1.amazonaws.com/${profile.profilePicture}` ||
      '',
  });

  const defaultImageUri =
    'https://i.pinimg.com/236x/db/1f/9a/db1f9a3eaca4758faae5f83947fa807c.jpg';

  const [loading, setLoading] = useState(false); // Add loading state

  const handleImagePicker = () => {
    launchImageLibrary(
      {mediaType: 'photo', maxWidth: 300, maxHeight: 300, quality: 1},
      response => {
        if (response.didCancel) {
          // Handle image selection cancelation
        } else if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
        } else {
          const uri = response.assets[0].uri;
          // Update the editableProfile state with the selected image URI
          setEditableProfile({...editableProfile, profilePicture: uri});
        }
      },
    );
  };

  const saveProfile = async () => {
    setLoading(true); // Set loading to true when starting the update
    try {
      const token = await AsyncStorage.getItem('accessToken');

      // Create a new FormData object
      const formData = new FormData();

      // Append profile data
      formData.append('fullName', editableProfile.fullName);
      formData.append(
        'currentFeelingAboutPartner',
        editableProfile.currentFeelingAboutPartner,
      );
      formData.append('myMood', editableProfile.myMood);

      // Check if there's an image to upload
      if (editableProfile.profilePicture) {
        const uri = editableProfile.profilePicture;
        const fileType = uri.split('.').pop(); // Get the file type from URI
        const fileName = `profilePicture.${fileType}`; // Create a file name based on the type

        // Append image to form data
        formData.append('profilePicture', {
          uri: uri,
          name: fileName,
          type: `image/${fileType}`, // The MIME type of the image
        });
      }

      const response = await fetch(
        'http://192.168.0.9:7000/api/v1/app/settings/profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': 'CuQvyhZDEhmvKdvdZmIrKgNbsmFjHQxhRKjWCvvQ',
            'x-app-version': '1.0.1',
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        const updatedData = await response.json();
        if (updatedData.success) {
          Alert.alert('Success', updatedData.message); // Show success message
          navigation.goBack();
        } else {
          console.error('Error updating profile:', updatedData.message);
        }
      } else {
        console.error('Error updating profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false); // Reset loading state when finished
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleImagePicker}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                editableProfile.profilePicture ||
                `https://chatapp1305.s3.eu-north-1.amazonaws.com/${profile.profilePicture}`, // Use the updated profilePicture from state
            }}
            style={styles.profilePicture}
            resizeMode="cover" // This will help to maintain the aspect ratio
          />
        </View>
      </TouchableOpacity>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={editableProfile.fullName}
        onChangeText={text =>
          setEditableProfile({...editableProfile, fullName: text})
        }
      />

      <Text style={styles.label}>Feeling About You</Text>
      <TextInput
        style={styles.input}
        value={editableProfile.currentFeelingAboutPartner}
        onChangeText={text =>
          setEditableProfile({
            ...editableProfile,
            currentFeelingAboutPartner: text,
          })
        }
      />

      <Text style={styles.label}>Mood</Text>
      <TextInput
        style={styles.input}
        value={editableProfile.myMood}
        onChangeText={text =>
          setEditableProfile({...editableProfile, myMood: text})
        }
      />

      {/* Show loader or save button based on loading state */}
      {loading ? (
        <ActivityIndicator size="large" color="#ff69b4" /> // Loading spinner
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
          <Text style={styles.buttonText}>💖 Save with Love 💖</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff0f5',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ff69b4',
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden', // Ensure that the image respects the round border
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: 60, // Keep the border radius
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff1493',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ffb6c1',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#ffe4e1',
    color: '#ff69b4',
  },
  saveButton: {
    backgroundColor: '#ff69b4',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#ff1493',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditProfilePage;
  