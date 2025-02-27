import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getToken } from '../services/auth';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  Callback: undefined;
  SavedTracks: undefined;
};

type CallbackNavigationProp = StackNavigationProp<RootStackParamList, 'Callback'>;

const Callback: React.FC = () => {
  const navigation = useNavigation<CallbackNavigationProp>();
  const route = useRoute();

  const fetchAndCacheProfile = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) return;
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.setItem('user_profile', JSON.stringify(response.data));
      if (response.data.images && response.data.images.length > 0) {
        await AsyncStorage.setItem('profile_pic', response.data.images[0].url);
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
    }
  };

  useEffect(() => {
    const { code } = route.params as { code?: string };
    if (code) {
      getToken(code)
        .then(() => fetchAndCacheProfile())
        .then(() => {
          navigation.navigate('SavedTracks');
        })
        .catch(err => {
          console.error('Failed to obtain token', err);
        });
    } else {
      console.error('Authorization code not found in route parameters');
    }
  }, [navigation, route.params]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading authentication details...</Text>
      <ActivityIndicator size="large" color="#1ED760" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginBottom: 16, fontSize: 16 },
});

export default Callback;
