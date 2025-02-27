module.exports = {
  create: (config) => {
    global.__capturedPanResponderConfig = config;
    return { panHandlers: config };
  },
};