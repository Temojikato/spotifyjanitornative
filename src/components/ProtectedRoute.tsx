import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { refreshAccessToken } from '../services/auth';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  Callback: undefined;
  SavedTracks: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigation = useNavigation<NavigationProp>();

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
          navigation.replace('Login');
        }
      }
    } catch (error) {
      setAuthenticated(false);
      navigation.replace('Login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const subscription = AppState.addEventListener('change', async nextAppState => {
      if (nextAppState === 'active') {
        // When the app comes to foreground, re-check authentication
        await checkAuth();
      }
    });
    return () => subscription.remove();
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  if (!authenticated) return null;
  return <>{children}</>;
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  }
});

export default ProtectedRoute;
