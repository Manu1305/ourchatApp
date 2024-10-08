import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [scale] = useState(new Animated.Value(1));
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!phoneNumber || !secretCode) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch(
        'http://192.168.0.9:7000/api/v1/app/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'CuQvyhZDEhmvKdvdZmIrKgNbsmFjHQxhRKjWCvvQ',
            'x-app-version': '1.0.1',
          },
          body: JSON.stringify({
            phoneNumber,
            secretCode,
          }),
        },
      );

      const data = await response.json();

      console.log(data,'dataa')
      if (response.ok && data.success) {
        // Store tokens in AsyncStorage
      await AsyncStorage.setItem('accessToken', data.data.accessToken);
      console.log('Access token saved:', data.data.accessToken);

      await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
      console.log('Refresh token saved:', data.data.refreshToken);

        // Store userId from userData
        const userId = data.data.userData._id; // Extract userId from userData
        if (userId) {
          await AsyncStorage.setItem('_id', userId);
          console.log('Stored User ID:', userId); // Log the stored user ID
        } else {
          console.error('User ID is undefined:', userId);
          Alert.alert('Error', 'User ID not found in response.');
        }

        Alert.alert('Success', data.message);
        navigation.replace('ChatList'); // Use replace instead of navigate
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error) {
      console.log(error, 'error');
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Secret Code"
        secureTextEntry
        value={secretCode}
        onChangeText={setSecretCode}
        autoCapitalize="none"
      />
      <Animated.View style={{transform: [{scale}]}}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            animateButton();
            handleLogin();
          }}
          activeOpacity={0.7}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#ffe6f2',
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
    textAlign: 'center',
    color: '#d5006d',
  },
  input: {
    height: 50,
    borderColor: '#d5006d',
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#d5006d',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25, 
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Login;
