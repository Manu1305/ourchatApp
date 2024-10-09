import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './src/screens/Login';
import ChatList from './src/screens/ChatsList';
import ChatPage from './src/screens/ChatScreen';
import SplashScreen from './src/screens/SplashScreen';
import messaging from '@react-native-firebase/messaging';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ProfilePage from './src/screens/Profile';
import {useEffect} from 'react';
import {firebase} from '@react-native-firebase/app'; // Make sure to import this

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      getFcmToken();
    } else {
      console.log('Permission not granted');
    }
  };

  const getFcmToken = async () => {
    try {
      const token = await messaging().getToken();
      if (token) {
        console.log('FCM Token:', token);
      } else {
        console.log('Failed to get FCM token');
      }
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  };

  const initializeFirebase = () => {
    console.log('Initializing Firebase...');
    if (!firebase.apps.length) {
      firebase.initializeApp(); // Initialize Firebase
      console.log('Firebase initialized successfully');
    } else {
      console.log('Firebase already initialized');
    }
  };

  useEffect(() => {
    initializeFirebase(); // Call Firebase initialization
    requestUserPermission(); // Request permission before getting the token
  }, []); // Add an empty dependency array to run only once

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ChatList" component={ChatList} />
        <Stack.Screen name="ChatScreen" component={ChatPage} />
        <Stack.Screen name="Profile" component={ProfilePage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
