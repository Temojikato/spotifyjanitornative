import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = {
  Login: undefined;
  Callback: undefined;
  SavedTracks: undefined;
  // other screens...
};
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface UserProfile {
  display_name: string;
  images: { url: string }[];
  product: string;
  country: string;
  email: string;
  id: string;
  followers: { total: number };
  external_urls: { spotify: string };
}

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Logout logic moved here from Header.
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'access_token',
        'code_verifier',
        'profile_pic',
        'user_profile'
      ]);
      navigation.replace('Login');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('user_profile');
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    if (open) {
      loadProfile();
    }
  }, [open]);

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#ffffff" />
          ) : profile ? (
            <ScrollView contentContainerStyle={styles.contentContainer}>
              {/* Header row with profile name on left and Logout on right */}
              <View style={styles.headerRow}>
                <Text style={styles.title}>{profile.display_name}</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.imageContainer}>
                {profile.images && profile.images[0] && (
                  <Image
                    source={{ uri: profile.images[0].url }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                )}
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{profile.email}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status:</Text>
                <Text style={styles.value}>{profile.product}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Country:</Text>
                <Text style={styles.value}>{profile.country}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Followers:</Text>
                <Text style={styles.value}>{profile.followers.total}</Text>
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => Linking.openURL(profile.external_urls.spotify)}
              >
                <Text style={styles.buttonText}>View on Spotify</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.contentContainer}>
              <Text style={styles.noProfileText}>
                No profile data found. Please log in again.
              </Text>
            </View>
          )}
          {/* Optionally, you may keep a close button at the bottom if needed */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#121212',
    borderRadius: 8,
    width: '90%',
    maxHeight: '80%',
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  logoutButton: {
    backgroundColor: '#FF3B30', // Adjust color as desired
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  profileImage: {
    height: 200,
    width: '100%',
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'space-between',
    width: '100%',
  },
  label: {
    color: '#b3b3b3',
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    color: '#ffffff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1ED760',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 16,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noProfileText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default ProfileModal;
