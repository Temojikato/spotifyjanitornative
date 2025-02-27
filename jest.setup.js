import 'react-native-gesture-handler/jestSetup';

import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import { NativeModules } from 'react-native';
if (!NativeModules.NativeDeviceInfo) {
  NativeModules.NativeDeviceInfo = {
    getConstants: () => ({}),
  };
}

import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
try {
  jest.mock('framer-motion', () => {
    const React = require('react');
    return {
      motion: {
        div: React.forwardRef((props, ref) => <div ref={ref} {...props} />),
        tr: React.forwardRef((props, ref) => <tr ref={ref} {...props} />),
      },
      AnimatePresence: ({ children }) => <>{children}</>,
    };
  });

  jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

  jest.mock('react-native-reanimated', () =>
    require('react-native-reanimated/mock')
  );

  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');


  beforeEach(() => {
    mockAsyncStorage.clear();
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockImplementation(() => 1_000_000);
  });

} catch (e) {
}
