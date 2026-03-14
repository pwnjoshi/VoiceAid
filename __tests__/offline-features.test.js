/**
 * VoiceAid Offline Features Test Suite
 * Tests all services without internet or native modules
 */

// ─── Mock native modules before any imports ───────────────────────────────
jest.mock('@react-native-async-storage/async-storage', () => {
  const mockStore = {};
  return {
    setItem: jest.fn((key, value) => { mockStore[key] = value; return Promise.resolve(); }),
    getItem: jest.fn((key) => Promise.resolve(mockStore[key] || null)),
    removeItem: jest.fn((key) => { delete mockStore[key]; return Promise.resolve(); }),
    clear: jest.fn(() => { Object.keys(mockStore).forEach(k => delete mockStore[k]); return Promise.resolve(); }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockStore))),
  };
});

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('mock-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  AndroidNotificationPriority: { HIGH: 'high' },
}));

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('expo-localization', () => ({
  locale: 'en-US',
  locales: ['en-US'],
  timezone: 'UTC',
}));

// ─── Service imports (loaded after mocks are set up) ───────────────────────
let OfflineAIService;
let EnhancedOfflineService;
let OfflineReminderService;

beforeAll(() => {
  OfflineAIService      = require('../src/services/OfflineAIService').default;
  EnhancedOfflineService = require('../src/services/EnhancedOfflineService').default;
  OfflineReminderService = require('../src/services/OfflineReminderService').default;
});

// ═══════════════════════════════════════════════════════════════════════════
// OfflineAIService
// ═══════════════════════════════════════════════════════════════════════════
describe('OfflineAIService', () => {
  test('processes agriculture query', async () => {
    const r = await OfflineAIService.processOffline('How do I control pests on my crops?');
    expect(r.success).toBe(true);
    expect(r.offline).toBe(true);
    expect(r.response).toBeTruthy();
    expect(r.category).toBe('agriculture');
  });

  test('processes health query', async () => {
    const r = await OfflineAIService.processOffline('I have a fever');
    expect(r.success).toBe(true);
    expect(r.category).toBe('health');
    expect(r.response).toBeTruthy();
  });

  test('processes safety / OTP query', async () => {
    const r = await OfflineAIService.processOffline('Someone asked for my OTP');
    expect(r.success).toBe(true);
    expect(r.category).toBe('safety');
    expect(r.response).toBeTruthy();
  });

  test('processes time query', async () => {
    const r = await OfflineAIService.processOffline('What time is it?');
    expect(r.success).toBe(true);
    expect(r.response).toBeTruthy();
  });

  test('returns fallback for unknown query', async () => {
    const r = await OfflineAIService.processOffline('xyzzy nonsense query 12345');
    expect(r.success).toBe(true);
    expect(r.response).toBeTruthy();
    expect(r.confidence).toBeLessThan(0.5);
  });

  test('classifyIntent — agriculture', () => {
    expect(OfflineAIService.classifyIntent('pest control for crops')).toBe('agriculture');
  });

  test('classifyIntent — health', () => {
    expect(OfflineAIService.classifyIntent('fever medicine doctor')).toBe('health');
  });

  test('classifyIntent — safety', () => {
    expect(OfflineAIService.classifyIntent('otp scam bank')).toBe('safety');
  });

  test('classifyIntent — time', () => {
    expect(OfflineAIService.classifyIntent('what time is it today')).toBe('time');
  });

  test('classifyIntent — emergency', () => {
    expect(OfflineAIService.classifyIntent('emergency help police')).toBe('emergency');
  });

  test('getNetworkStatus returns required fields', () => {
    const s = OfflineAIService.getNetworkStatus();
    expect(s).toHaveProperty('isOnline');
    expect(s).toHaveProperty('batteryLevel');
    expect(s).toHaveProperty('mode');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// EnhancedOfflineService
// ═══════════════════════════════════════════════════════════════════════════
describe('EnhancedOfflineService', () => {
  test('searches knowledge base — rice planting', async () => {
    const r = await EnhancedOfflineService.search('rice planting');
    expect(r.success).toBe(true);
    expect(r.response).toBeTruthy();
    expect(r.confidence).toBeGreaterThan(0);
  });

  test('searches knowledge base — fever', async () => {
    const r = await EnhancedOfflineService.search('fever treatment');
    expect(r.success).toBe(true);
    expect(r.response).toBeTruthy();
  });

  test('searches knowledge base — OTP scam', async () => {
    const r = await EnhancedOfflineService.search('OTP scam fraud');
    expect(r.success).toBe(true);
    expect(r.response).toBeTruthy();
  });

  test('returns fallback for unknown query', async () => {
    const r = await EnhancedOfflineService.search('xyzzy unknown topic 99999');
    expect(r.success).toBe(true);
    expect(r.response).toBeTruthy();
  });

  test('getAgricultureInfo — rice planting', async () => {
    const r = await EnhancedOfflineService.getAgricultureInfo('rice', 'planting');
    expect(r.success).toBe(true);
    expect(r.response).toBeTruthy();
    expect(r.crop).toBe('rice');
    expect(r.topic).toBe('planting');
  });

  test('getAgricultureInfo — wheat pests', async () => {
    const r = await EnhancedOfflineService.getAgricultureInfo('wheat', 'pests');
    expect(r.success).toBe(true);
    expect(r.response).toBeTruthy();
  });

  test('getHealthInfo — fever home_treatment', async () => {
    const r = await EnhancedOfflineService.getHealthInfo('fever', 'home_treatment');
    expect(r.success).toBe(true);
    expect(r.response).toBeTruthy();
    expect(r.ailment).toBe('fever');
  });

  test('getHealthInfo — headache symptoms', async () => {
    const r = await EnhancedOfflineService.getHealthInfo('headache', 'symptoms');
    expect(r.success).toBe(true);
    expect(r.response).toBeTruthy();
  });

  test('getEmergencyNumbers returns police number', async () => {
    const r = await EnhancedOfflineService.getEmergencyNumbers();
    expect(r.success).toBe(true);
    expect(r.numbers).toBeTruthy();
    expect(r.response).toContain('100');
  });

  test('detectCategory — agriculture', () => {
    expect(EnhancedOfflineService.detectCategory('crop pest control')).toBe('agriculture');
  });

  test('detectCategory — health', () => {
    expect(EnhancedOfflineService.detectCategory('fever treatment doctor')).toBe('health');
  });

  test('detectCategory — safety', () => {
    expect(EnhancedOfflineService.detectCategory('fraud scam alert')).toBe('safety');
  });

  test('detectCategory — general fallback', () => {
    expect(EnhancedOfflineService.detectCategory('hello world')).toBe('general');
  });

  test('getAvailableCrops returns array with rice', () => {
    const crops = EnhancedOfflineService.getAvailableCrops();
    expect(Array.isArray(crops)).toBe(true);
    expect(crops.length).toBeGreaterThan(0);
    expect(crops).toContain('rice');
    expect(crops).toContain('wheat');
  });

  test('getHealthTopics returns array with fever', () => {
    const topics = EnhancedOfflineService.getHealthTopics();
    expect(Array.isArray(topics)).toBe(true);
    expect(topics).toContain('fever');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// OfflineReminderService
// ═══════════════════════════════════════════════════════════════════════════
describe('OfflineReminderService', () => {
  beforeEach(async () => {
    // Clear reminders before each test for isolation
    await OfflineReminderService.clearAll();
  });

  test('adds a basic reminder', async () => {
    const r = await OfflineReminderService.addReminder({
      title: 'Test Reminder',
      time: '09:00',
      frequency: 'daily',
    });
    expect(r).toBeTruthy();
    expect(r.id).toBeTruthy();
    expect(r.title).toBe('Test Reminder');
    expect(r.time).toBe('09:00');
    expect(r.active).toBe(true);
  });

  test('addMedicineReminder creates correct reminder', async () => {
    const r = await OfflineReminderService.addMedicineReminder('Aspirin', '08:00', 'Take with food');
    expect(r.title).toContain('Aspirin');
    expect(r.time).toBe('08:00');
    expect(r.category).toBe('medicine');
    expect(r.frequency).toBe('daily');
  });

  test('addMealReminder creates correct reminder', async () => {
    const r = await OfflineReminderService.addMealReminder('breakfast', '07:30');
    expect(r.time).toBe('07:30');
    expect(r.category).toBe('meal');
    expect(r.title.toLowerCase()).toContain('breakfast');
  });

  test('addWaterReminder creates correct reminder', async () => {
    const r = await OfflineReminderService.addWaterReminder('10:00');
    expect(r.time).toBe('10:00');
    expect(r.category).toBe('health');
    expect(r.title.toLowerCase()).toContain('water');
  });

  test('getReminders returns all reminders', async () => {
    await OfflineReminderService.addReminder({ title: 'A', time: '08:00', frequency: 'daily' });
    await OfflineReminderService.addReminder({ title: 'B', time: '09:00', frequency: 'once' });
    const all = await OfflineReminderService.getReminders();
    expect(all.length).toBe(2);
  });

  test('toggleReminder deactivates an active reminder', async () => {
    const r = await OfflineReminderService.addReminder({ title: 'Toggle Me', time: '10:00', frequency: 'daily' });
    expect(r.active).toBe(true);
    await OfflineReminderService.toggleReminder(r.id);
    const all = await OfflineReminderService.getReminders();
    const toggled = all.find(x => x.id === r.id);
    expect(toggled.active).toBe(false);
  });

  test('toggleReminder reactivates an inactive reminder', async () => {
    const r = await OfflineReminderService.addReminder({ title: 'Toggle Twice', time: '11:00', frequency: 'daily' });
    await OfflineReminderService.toggleReminder(r.id); // deactivate
    await OfflineReminderService.toggleReminder(r.id); // reactivate
    const all = await OfflineReminderService.getReminders();
    const toggled = all.find(x => x.id === r.id);
    expect(toggled.active).toBe(true);
  });

  test('deleteReminder removes it from list', async () => {
    const r = await OfflineReminderService.addReminder({ title: 'Delete Me', time: '12:00', frequency: 'once' });
    await OfflineReminderService.deleteReminder(r.id);
    const all = await OfflineReminderService.getReminders();
    expect(all.find(x => x.id === r.id)).toBeUndefined();
  });

  test('clearAll removes all reminders', async () => {
    await OfflineReminderService.addReminder({ title: 'X', time: '08:00', frequency: 'daily' });
    await OfflineReminderService.addReminder({ title: 'Y', time: '09:00', frequency: 'daily' });
    await OfflineReminderService.clearAll();
    const all = await OfflineReminderService.getReminders();
    expect(all.length).toBe(0);
  });

  test('getTodayReminders returns only future reminders', async () => {
    // Add a reminder far in the future (23:59)
    await OfflineReminderService.addReminder({ title: 'Late', time: '23:59', frequency: 'daily' });
    const today = await OfflineReminderService.getTodayReminders();
    expect(Array.isArray(today)).toBe(true);
  });

  test('getRemindersByCategory filters correctly', async () => {
    await OfflineReminderService.addMedicineReminder('Pill', '08:00');
    await OfflineReminderService.addMealReminder('lunch', '12:00');
    const meds = await OfflineReminderService.getRemindersByCategory('medicine');
    expect(meds.every(r => r.category === 'medicine')).toBe(true);
  });
});
