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
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

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

  useFocusEffect(
    React.useCallback(() => {
      fetchProfileData();
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff69b4" />
      </View>
    );
  }

  const defaultImageUri =
    'https://i.pinimg.com/236x/db/1f/9a/db1f9a3eaca4758faae5f83947fa807c.jpg';

  return (
    <LinearGradient colors={['#ffe4e1', '#ffb6c1']} style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri: profile?.profilePicture
              ? `https://chatapp1305.s3.eu-north-1.amazonaws.com/${profile.profilePicture}`
              : defaultImageUri,
          }}
          style={styles.profilePicture}
        />

        <Text style={styles.name}>{profile?.fullName || 'Your Name'}</Text>
        <Text style={styles.feeling}>
          ❤️{' '}
          {profile?.currentFeelingAboutPartner
            ? `Feeling 💕 ${profile.currentFeelingAboutPartner}`
            : 'Feeling Unknown 💕'}{' '}
          ❤️
        </Text>
        <Text style={styles.mood}>Mood: {profile?.myMood || 'Normal'}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            navigation.navigate('editPage', {profile});
          }}>
          <Text style={styles.buttonText}>Edit Profile</Text>
          <Image source={require('../assets/edit.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 25,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#ff69b4',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff69b4',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#ff69b4',
    shadowColor: '#ffb6c1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 5,
    fontFamily: 'Cursive',
  },
  feeling: {
    fontSize: 22,
    color: '#ff1493',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center', // Center the text
  },
  mood: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff69b4',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: 5,
  },
});

export default ProfilePage;
