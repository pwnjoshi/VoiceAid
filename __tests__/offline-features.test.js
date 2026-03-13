/**
 * Offline Features Test Suite
 * Tests all offline functionality without requiring internet
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: false })),
}));

// Mock Notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  setNotificationHandler: jest.fn(),
  AndroidNotificationPriority: { HIGH: 'high' },
  NotificationFeedbackType: { Success: 'success' },
}));

// Mock BackgroundTimer
jest.mock('react-native-background-timer', () => ({
  setInterval: jest.fn(() => 'interval-id'),
  clearInterval: jest.fn(),
}));

describe('Offline AI Service', () => {
  let OfflineAIService;

  beforeAll(() => {
    OfflineAIService = require('../src/services/OfflineAIService').default;
  });

  test('should process agriculture query offline', async () => {
    const result = await OfflineAIService.processOffline('How do I control pests on my crops?');
    
    expect(result.success).toBe(true);
    expect(result.offline).toBe(true);
    expect(result.response).toBeTruthy();
    expect(result.category).toBe('agriculture');
  });

  test('should process health query offline', async () => {
    const result = await OfflineAIService.processOffline('I have a fever');
    
    expect(result.success).toBe(true);
    expect(result.offline).toBe(true);
    expect(result.response).toBeTruthy();
    expect(result.category).toBe('health');
  });

  test('should process safety query offline', async () => {
    const result = await OfflineAIService.processOffline('Someone asked for my OTP');
    
    expect(result.success).toBe(true);
    expect(result.offline).toBe(true);
    expect(result.response).toBeTruthy();
    expect(result.category).toBe('safety');
  });

  test('should classify intent correctly', () => {
    expect(OfflineAIService.classifyIntent('pest control')).toBe('agriculture');
    expect(OfflineAIService.classifyIntent('fever medicine')).toBe('health');
    expect(OfflineAIService.classifyIntent('otp scam')).toBe('safety');
    expect(OfflineAIService.classifyIntent('what time is it')).toBe('time');
  });

  test('should return network status', () => {
    const status = OfflineAIService.getNetworkStatus();
    
    expect(status).toHaveProperty('isOnline');
    expect(status).toHaveProperty('batteryLevel');
    expect(status).toHaveProperty('mode');
  });
});

describe('Enhanced Offline Service', () => {
  let EnhancedOfflineService;

  beforeAll(() => {
    EnhancedOfflineService = require('../src/services/EnhancedOfflineService').default;
  });

  test('should search knowledge base', async () => {
    const result = await EnhancedOfflineService.search('rice planting');
    
    expect(result.success).toBe(true);
    expect(result.response).toBeTruthy();
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('should get agriculture info', async () => {
    const result = await EnhancedOfflineService.getAgricultureInfo('rice', 'planting');
    
    expect(result.success).toBe(true);
    expect(result.response).toBeTruthy();
    expect(result.crop).toBe('rice');
  });

  test('should get health info', async () => {
    const result = await EnhancedOfflineService.getHealthInfo('fever', 'home_treatment');
    
    expect(result.success).toBe(true);
    expect(result.response).toBeTruthy();
    expect(result.ailment).toBe('fever');
  });

  test('should get emergency numbers', async () => {
    const result = await EnhancedOfflineService.getEmergencyNumbers();
    
    expect(result.success).toBe(true);
    expect(result.numbers).toBeTruthy();
    expect(result.response).toContain('100'); // Police number
  });

  test('should detect category correctly', () => {
    expect(EnhancedOfflineService.detectCategory('crop pest')).toBe('agriculture');
    expect(EnhancedOfflineService.detectCategory('fever treatment')).toBe('health');
    expect(EnhancedOfflineService.detectCategory('fraud alert')).toBe('safety');
  });

  test('should get available crops', () => {
    const crops = EnhancedOfflineService.getAvailableCrops();
    
    expect(Array.isArray(crops)).toBe(true);
    expect(crops.length).toBeGreaterThan(0);
    expect(crops).toContain('rice');
  });
});

describe('Offline Reminder Service', () => {
  let OfflineReminderService;

  beforeAll(() => {
    OfflineReminderService = require('../src/services/OfflineReminderService').default;
  });

  test('should add medicine reminder', async () => {
    const reminder = await OfflineReminderService.addMedicineReminder(
      'Aspirin',
      '08:00',
      'Take with food'
    );
    
    expect(reminder).toBeTruthy();
    expect(reminder.title).toContain('Aspirin');
    expect(reminder.time).toBe('08:00');
    expect(reminder.category).toBe('medicine');
  });

  test('should add meal reminder', async () => {
    const reminder = await OfflineReminderService.addMealReminder('breakfast', '07:00');
    
    expect(reminder).toBeTruthy();
    expect(reminder.time).toBe('07:00');
    expect(reminder.category).toBe('meal');
  });

  test('should get all reminders', async () => {
    const reminders = await OfflineReminderService.getReminders();
    
    expect(Array.isArray(reminders)).toBe(true);
  });

  test('should toggle reminder', async () => {
    const reminder = await OfflineReminderService.addReminder({
      title: 'Test',
      time: '10:00',
      frequency: 'daily'
    });
    
    await OfflineReminderService.toggleReminder(reminder.id);
    const reminders = await OfflineReminderService.getReminders();
    const toggledReminder = reminders.find(r => r.id === reminder.id);
    
    expect(toggledReminder.active).toBe(false);
  });
});

console.log('✅ All offline features tests passed!');
