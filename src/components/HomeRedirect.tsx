// HomeRedirect.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const HomeRedirect: React.FC = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        navigation.replace('SavedTracks'); // Replace with your actual route name
      } else {
        navigation.replace('Login');
      }
    };
    checkToken();
  }, [navigation]);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#1ED760" />
    </View>
  );
};

export default HomeRedirect;
