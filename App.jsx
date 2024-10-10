import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './src/screens/Login';
import ChatList from './src/screens/ChatsList';
import ChatPage from './src/screens/ChatScreen';
import SplashScreen from './src/screens/SplashScreen';
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid} from 'react-native';
import {firebase} from '@react-native-firebase/app'; // Import Firebase
import ProfilePage from './src/screens/Profile';
import PostScreen from './src/screens/postsScreen';
import AddPostScreen from './src/screens/newPost';
import CreateChatGroup from './src/screens/CreateGroupScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  // useEffect(() => {
  //   const requestUserPermission = async () => {
  //     console.log('Requesting notification permission...');

  //     // Request notification permission
  //     const permissionStatus = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  //     );
  //     console.log('Notification permission status:', permissionStatus);

  //     // Request FCM permission
  //     const authStatus = await messaging().requestPermission();
  //     console.log('Auth status for FCM:', authStatus);

  //     const enabled =
  //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //     if (enabled) {
  //       console.log(
  //         'Notification permissions enabled, attempting to get FCM token...',
  //       );
  //       try {
  //         const token = await messaging().getToken();
  //         console.log('Attempting to get FCM token...');
  //         if (token) {
  //           console.log('FCM Token generated successfully:', token);
  //         } else {
  //           console.log(
  //             'No FCM token returned. Please check your Firebase setup.',
  //           );
  //         }
  //       } catch (error) {
  //         console.error('Error during FCM token generation:', error);
  //       }
  //     } else {
  //       console.log('Notification permission not granted:', authStatus);
  //     }
  //   };

  //   requestUserPermission();
  // }, []);

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
        <Stack.Screen name="PostScreen" component={PostScreen} />
        <Stack.Screen name="Newpost" component={AddPostScreen} />
        <Stack.Screen name="Newgroup" component={CreateChatGroup} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
