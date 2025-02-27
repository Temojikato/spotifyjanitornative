import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  PanResponder,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface MobileTrackItemProps {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  onRemove: (id: string) => void;
}

const MobileTrackItem: React.FC<MobileTrackItemProps> = ({ id, title, artist, albumArt, onRemove }) => {
  const swipeDelta = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentDelta, setCurrentDelta] = useState(0);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  useEffect(() => {
    const listenerId = swipeDelta.addListener(({ value }) => setCurrentDelta(value));
    return () => swipeDelta.removeListener(listenerId);
  }, [swipeDelta]);

  const threshold = Math.max(containerWidth * 0.75, 150);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          swipeDelta.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= threshold) {
          onRemove(id);
        }
        Animated.timing(swipeDelta, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View
      testID="container"
      style={styles.container}
      onLayout={onContainerLayout}
    >
      {currentDelta > 20 && (
        <View style={[styles.deleteBackground, { width: currentDelta }]}>
          <MaterialIcons name="delete" size={24} color="white" />
        </View>
      )}
      <Animated.View
        testID="swipe-view"
        style={[styles.item, { transform: [{ translateX: swipeDelta }] }]}
        {...panResponder.panHandlers}
      >
        <Image source={{ uri: albumArt }} style={styles.albumArt} />
        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.artist}>{artist}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: 'relative',
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 16,
    zIndex: 0,
  },
  item: {
    backgroundColor: '#121212',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 14,
  },
});

export default MobileTrackItem;
