import { StyleSheet } from 'react-native';

export const globalToastStyles = StyleSheet.create({
  base: {
    backgroundColor: '#121212',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoGlow: {
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  successGlow: {
    borderWidth: 2,
    borderColor: '#1ED760',
    shadowColor: '#1ED760',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  errorGlow: {
    borderWidth: 2,
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});
