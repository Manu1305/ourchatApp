import React, {useEffect} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (accessToken) {
          // Navigate to ChatList if token exists
          navigation.replace('ChatList');
        } else {
          // Navigate to Login if no token
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error retrieving token', error);
        navigation.replace('Login'); // Default to login if error occurs
      }
    };

    checkToken();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#d5006d" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe6f2',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#d5006d',
  },
});

export default SplashScreen;
