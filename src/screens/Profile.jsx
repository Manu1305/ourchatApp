import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient'; // You need to install this package

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      const response = await fetch(
        'http://192.168.0.9:7000/api/v1/app/settings/profile',
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
        setProfile(data.data);
      } else {
        console.error('Error fetching profile:', data.message);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="pink" />
      </View>
    );
  }

  const defaultImageUri =
    'https://i.pinimg.com/236x/db/1f/9a/db1f9a3eaca4758faae5f83947fa807c.jpg';

  return (
    <LinearGradient colors={['#ffefba', '#ffffff']} style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{uri: profile?.profilePic || defaultImageUri}}
          style={styles.profilePicture}
        />
        <Text style={styles.name}>{profile?.fullName || 'Your Name'}</Text>
        <Text style={styles.about}>
          {profile?.about || 'This is a short description about yourself.'}
        </Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  card: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // for Android
    alignItems: 'center',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'pink',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // for Android
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'pink',
    marginBottom: 10,
  },
  about: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    color: '#333',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: 'pink',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProfilePage;
