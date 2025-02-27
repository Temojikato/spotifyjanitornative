module.exports = {
  preset: "react-native",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "cjs", "mjs"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx|mjs)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules[/\\\\](?!((jest-)?react-native|@react-native|@react-navigation|react-native-vector-icons))"
    ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    '\\.png$': 'react-native/Libraries/Image/RelativeImageStub',
    "^react-native-vector-icons/.*$": "<rootDir>/__mocks__/vectorIcons.js",
    "^react-native/Libraries/Interaction/PanResponder$": "<rootDir>/__mocks__/PanResponder.js",
    "^react/jsx-runtime$": "<rootDir>/node_modules/react/jsx-runtime.js",
  },
};
