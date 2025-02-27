declare global {
  var __capturedPanResponderConfig: any;
}
global.__capturedPanResponderConfig = null;

import React from 'react';
import { render, act } from '@testing-library/react-native';
import MobileTrackItem from '../../src/components/MobileTrackItem';
import { Animated, PanResponder, Image, PanResponderCallbacks, PanResponderInstance } from 'react-native';

jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');

jest.spyOn(Animated, 'timing').mockImplementation(() => ({
  start: (callback?: (result: { finished: boolean }) => void) => {
    if (callback) callback({ finished: true });
  },
  stop: () => { },
  reset: () => { },
}));

beforeAll(() => {
  jest.spyOn(PanResponder, 'create').mockImplementation(
    (config: PanResponderCallbacks): PanResponderInstance => {
      global.__capturedPanResponderConfig = config;

      return {
        panHandlers: {
          onStartShouldSetResponder: config.onStartShouldSetPanResponder as unknown as (event: any) => boolean,
          onStartShouldSetResponderCapture: config.onStartShouldSetPanResponderCapture as unknown as (event: any) => boolean,

          onMoveShouldSetResponder: config.onMoveShouldSetPanResponder as unknown as (event: any) => boolean,
          onMoveShouldSetResponderCapture: config.onMoveShouldSetPanResponderCapture as unknown as (event: any) => boolean,

          onResponderMove: config.onPanResponderMove as unknown as (event: any) => void,
          onResponderGrant: config.onPanResponderGrant as unknown as (event: any) => void,
          onResponderRelease: config.onPanResponderRelease as unknown as (event: any) => void,
          onResponderEnd: config.onPanResponderEnd as unknown as (event: any) => void,
          onResponderTerminate: config.onPanResponderTerminate as unknown as (event: any) => void,
          onResponderReject: config.onPanResponderReject as unknown as (event: any) => void,
          onResponderStart: config.onPanResponderStart as unknown as (event: any) => void,
          onResponderTerminationRequest: config.onPanResponderTerminationRequest as unknown as (event: any) => boolean,
        },
      };
    }
  );
});

afterAll(() => {
  (PanResponder.create as jest.Mock).mockRestore();
});

describe('MobileTrackItem (Monkey-Patch)', () => {
  const props = {
    id: '1',
    title: 'Test Song',
    artist: 'Test Artist',
    albumArt: 'http://example.com/art.jpg',
    onRemove: jest.fn(),
  };

  beforeEach(() => {
    props.onRemove.mockReset();
    global.__capturedPanResponderConfig = null;
  });

  it('renders title, artist, and album art', () => {
    const { getByText, getByTestId, UNSAFE_getByType } = render(<MobileTrackItem {...props} />);

    expect(getByText('Test Song')).toBeTruthy();
    expect(getByText('Test Artist')).toBeTruthy();

    const swipeView = getByTestId('swipe-view');
    const image = swipeView ? swipeView.findByType(Image) : null;
    expect(image?.props.source).toEqual({ uri: props.albumArt });
  });

  it('calls onRemove when swipe exceeds threshold (dx > 150)', async () => {
    render(<MobileTrackItem {...props} />);

    expect(global.__capturedPanResponderConfig).not.toBeNull();
    const config = global.__capturedPanResponderConfig;

    const fakeEvent = { nativeEvent: {} };
    const gestureState = {
      dx: 160,
      dy: 0,
      moveX: 160,
      moveY: 0,
      x0: 0,
      y0: 0,
      numberActiveTouches: 1,
      stateID: 1,
    };

    await act(async () => {
      config.onMoveShouldSetPanResponder(fakeEvent, gestureState);
      config.onPanResponderMove(fakeEvent, gestureState);
      config.onPanResponderRelease(fakeEvent, gestureState);
    });

    expect(props.onRemove).toHaveBeenCalledWith('1');
  });

  it('does not call onRemove when swipe is below threshold (dx < 150)', async () => {
    render(<MobileTrackItem {...props} />);
    expect(global.__capturedPanResponderConfig).not.toBeNull();

    const config = global.__capturedPanResponderConfig;
    const fakeEvent = { nativeEvent: {} };
    const gestureState = {
      dx: 100,
      dy: 0,
      moveX: 100,
      moveY: 0,
      x0: 0,
      y0: 0,
      numberActiveTouches: 1,
      stateID: 1,
    };

    await act(async () => {
      config.onMoveShouldSetPanResponder(fakeEvent, gestureState);
      config.onPanResponderMove(fakeEvent, gestureState);
      config.onPanResponderRelease(fakeEvent, gestureState);
    });

    expect(props.onRemove).not.toHaveBeenCalled();
  });
});
