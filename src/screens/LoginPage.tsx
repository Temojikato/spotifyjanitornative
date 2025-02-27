import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { redirectToSpotifyAuth } from '../services/auth';

const LoginPage: React.FC = () => {

  const handleLogin = async () => {
    try {
      await redirectToSpotifyAuth();
    } catch (error) {
      console.error('Error during Spotify authentication', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Spotify Janitor</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login with Spotify</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    fontSize: 30,
    color: 'white',
    marginBottom: 32,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1ED760',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default LoginPage;
