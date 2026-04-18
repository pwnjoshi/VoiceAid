const Voice = {
  onSpeechStart: null,
  onSpeechEnd: null,
  onSpeechResults: null,
  onSpeechPartialResults: null,
  onSpeechError: null,
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn().mockResolvedValue(undefined),
  removeAllListeners: jest.fn(),
};

export default Voice;
