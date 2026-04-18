const ExpoSpeechRecognitionModule = {
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
};

const useSpeechRecognitionEvent = jest.fn();

module.exports = { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent };
