// src/toastConfig.ts
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UndoToast from './components/UndoToast';
import Toast from 'react-native-toast-message';

export const toastConfig = {
  // Custom undo type
  undo: ({ props }: any) => (
    <UndoToast
      trackTitle={props.trackTitle}
      onUndo={props.onUndo}
      closeToast={() => Toast.hide()}
    />
  ),
  // Optionally, add defaults for info, success, error
  info: ({ text1 }: any) => (
    <View style={defaultStyles.container}>
      <Text style={defaultStyles.text}>{text1}</Text>
    </View>
  ),
  success: ({ text1 }: any) => (
    <View style={defaultStyles.container}>
      <Text style={defaultStyles.text}>{text1}</Text>
    </View>
  ),
  error: ({ text1 }: any) => (
    <View style={defaultStyles.container}>
      <Text style={defaultStyles.text}>{text1}</Text>
    </View>
  ),
};

const defaultStyles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});
