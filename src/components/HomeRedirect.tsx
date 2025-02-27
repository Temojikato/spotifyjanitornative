import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  SavedTracks: undefined;
  Login: undefined;
};

const HomeRedirect: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        navigation.replace('SavedTracks');
      } else {
        navigation.replace('Login');
      }
    };
    checkToken();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator testID="loading-indicator" size="large" color="#1ED760" />
    </View>
  );
};

export default HomeRedirect;
