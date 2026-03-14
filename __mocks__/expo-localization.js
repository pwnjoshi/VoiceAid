module.exports = {
  locale: 'en-US',
  locales: ['en-US'],
  timezone: 'America/New_York',
  isRTL: false,
  getLocales: jest.fn(() => [{ languageCode: 'en', regionCode: 'US' }]),
};
