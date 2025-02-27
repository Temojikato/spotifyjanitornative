import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginPage from './src/screens/LoginPage';
import Callback from './src/screens/Callback';
import SavedTracksPage from './src/screens/SavedTracksPage';
import { refreshAccessToken } from './src/services/auth';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/toastConfig';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type RootStackParamList = {
  Login: undefined;
  Callback: undefined;
  SavedTracks: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['spotifyjanitor://'],
  config: {
    screens: {
      Callback: 'callback',
      SavedTracks: 'SavedTracks',
    },
  },
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const tokenExpiry = await AsyncStorage.getItem('token_expiry');
        if (token && tokenExpiry && Date.now() < Number(tokenExpiry)) {
          setAuthenticated(true);
        } else {
          const refreshToken = await AsyncStorage.getItem('refresh_token');
          if (refreshToken) {
            await refreshAccessToken();
            setAuthenticated(true);
          } else {
            setAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    MaterialIcons.loadFont();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1ED760" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer linking={linking}>
        <Stack.Navigator initialRouteName={authenticated ? "SavedTracks" : "Login"} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginPage} />
          <Stack.Screen name="Callback" component={Callback} />
          <Stack.Screen name="SavedTracks" component={SavedTracksPage} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast config={toastConfig} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212'
  },
});

export default App;
