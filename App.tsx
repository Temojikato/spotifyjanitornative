import React, { useState, useEffect, createContext } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/toastConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import LoginPage from './src/screens/LoginPage';
import Callback from './src/screens/Callback';
import SavedTracksPage from './src/screens/SavedTracksPage';
import ProtectedRoute from './src/components/ProtectedRoute';
import {
  refreshAccessToken,
  logout as logoutFn
} from './src/services/auth'; 
import { AuthContext } from './src/context/AuthContext';


const Stack = createStackNavigator();

const linking = {
  prefixes: ['spotifyjanitor://'],
  config: {
    screens: {
      Callback: 'callback',
      SavedTracks: 'SavedTracks',
    },
  },
};

export default function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    MaterialIcons.loadFont(); 
  }, []);

  useEffect(() => {

    const checkTokens = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        const expiryString = await AsyncStorage.getItem('token_expiry');
        const refreshToken = await AsyncStorage.getItem('refresh_token');

        console.log('[Startup] Stored tokens:', {
          accessToken,
          expiryString,
          refreshToken,
        });

        if (accessToken && expiryString && Date.now() < Number(expiryString)) {
          console.log('[Startup] Access token is still valid.');
          setIsAuthenticated(true);
          return;
        }

        if (refreshToken) {
          console.log('[Startup] Attempting to refresh...');
          try {
            await refreshAccessToken();
            const newAccess = await AsyncStorage.getItem('access_token');
            const newExpiryStr = await AsyncStorage.getItem('token_expiry');
            if (newAccess && newExpiryStr && Date.now() < Number(newExpiryStr)) {
              console.log('[Startup] Successfully refreshed, user is authed');
              setIsAuthenticated(true);
              return;
            } else {
              console.log('[Startup] Refresh attempt failed or still invalid');
              setIsAuthenticated(false);
            }
          } catch (err) {
            console.log('[Startup] Refresh error:', err);
            setIsAuthenticated(false);
          }
        } else {
          console.log('[Startup] No valid tokens, must log in');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('[Startup] Error checking tokens:', error);
        setIsAuthenticated(false);
      } finally {
        setAppLoading(false);
      }
    };

    checkTokens();
  }, []);

  const logout = async () => {
    await logoutFn(); 
    setIsAuthenticated(false);
  };

  if (appLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1ED760" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        logout,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer linking={linking}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>

            {!isAuthenticated ? (
              <>
                <Stack.Screen name="Login" component={LoginPage} />
                <Stack.Screen name="Callback" component={Callback} />
              </>
            ) : (
              <>

                <Stack.Screen name="SavedTracks">
                  {() => (
                    <ProtectedRoute>
                      <SavedTracksPage />
                    </ProtectedRoute>
                  )}
                </Stack.Screen>
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
        <Toast config={toastConfig} />
      </SafeAreaView>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
});
