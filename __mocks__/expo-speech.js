module.exports = {
  speak: jest.fn((text, options) => {
    if (options && options.onDone) setTimeout(options.onDone, 10);
    return Promise.resolve();
  }),
  stop: jest.fn(() => Promise.resolve()),
  pause: jest.fn(() => Promise.resolve()),
  resume: jest.fn(() => Promise.resolve()),
  isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
};
