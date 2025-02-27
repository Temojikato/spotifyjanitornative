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

  jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
  );

  jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
} catch (e) {
}
