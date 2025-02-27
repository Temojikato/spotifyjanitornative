// src/components/UndoToast.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { globalToastStyles } from '../styles/globalToastStyles';

interface UndoToastProps {
  trackTitle: string;
  onUndo: () => void;
  closeToast?: () => void;
  style?: StyleProp<ViewStyle>;
}

const UndoToast: React.FC<UndoToastProps> = ({ trackTitle, onUndo, closeToast, style }) => {
  const handleUndoClick = () => {
    onUndo();
    if (closeToast) closeToast();
  };

  return (
    <View style={[globalToastStyles.base, globalToastStyles.successGlow, styles.undoContainer, style]}>
      <Text style={[globalToastStyles.text, styles.message]}>
        Removed "{trackTitle}"
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleUndoClick}>
        <Text style={styles.buttonText}>Undo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  undoContainer: {
    flexDirection: 'row',
    // Override global alignment
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8, // optional: additional horizontal padding if desired
  },
  message: {
    flex: 1,
    marginRight: 8,
    fontSize: 16,
    color: 'white', // force white text if global style isn't applied correctly
    textAlign: 'left',
  },
  button: {
    backgroundColor: '#1ED760',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default UndoToast;
