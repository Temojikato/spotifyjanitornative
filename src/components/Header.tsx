import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import ProfileModal from './ProfileModal';

const Header: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

  // Determine if the avatar should show (i.e. when logged in)
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('access_token');
      setIsLoggedIn(!!token);
      const pic = await AsyncStorage.getItem('profile_pic');
      setProfilePicUrl(pic);
    };
    checkLogin();
  }, []);

  // Define which route names shouldn’t show the back arrow.
  const excludedRoutes = ['Home', 'Login', 'SavedTracks'];
  const showBackArrow =
    !excludedRoutes.includes(route.name as string) && navigation.canGoBack();

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const handleTitleClick = () => {
    // Redirect to your home screen – adjust as needed
    navigation.navigate('Home' as never);
  };

  return (
    <View style={styles.header}>
      {showBackArrow && (
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>{'<'}{/* Replace with an icon if desired */}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={handleTitleClick} style={styles.titleContainer}>
        <Image
          source={require('../assets/Spotify.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Janitor</Text>
      </TouchableOpacity>
      {isLoggedIn && (
        <TouchableOpacity onPress={() => setProfileModalVisible(true)}>
          <Image
            source={
              profilePicUrl
                ? { uri: profilePicUrl }
                : require('../assets/default-avatar.png')
            }
            style={styles.avatar}
          />
        </TouchableOpacity>
      )}

      {/* Profile modal is now opened immediately when avatar is pressed */}
      <ProfileModal
        open={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    marginRight: 10
  },
  backText: {
    color: '#fff',
    fontSize: 18
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600'
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18
  }
});

export default Header;
