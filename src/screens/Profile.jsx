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
    <LinearGradient colors={['#ffe4e1', '#ffffff']} style={styles.container}>
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
          {/* Replace this PNG image source with your own */}
          <Image
            source={require('../assets/edit.png')} // Adjust the path accordingly
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Center vertically
    alignItems: 'center', // Center horizontally
    padding: 20,
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
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#f00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5, // for Android
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff69b4', // Cute pink border
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 10, // Reduced roundness
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#ff69b4',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 5,
  },
  about: {
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
    color: '#555',
    marginBottom: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff69b4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 10,
  },
  icon: {
    width: 20, // Adjust width and height as per your icon size
    height: 20,
    marginLeft: 5,
  },
});

export default ProfilePage;
