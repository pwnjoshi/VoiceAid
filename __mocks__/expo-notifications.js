module.exports = {
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('mock-notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  AndroidNotificationPriority: { HIGH: 'high', DEFAULT: 'default', LOW: 'low' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
};
