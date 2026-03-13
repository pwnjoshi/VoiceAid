// Knowledge Categories Constants
// Centralized category definitions

const CATEGORIES = {
  AGRICULTURE: 'agriculture',
  HEALTH: 'health',
  SAFETY: 'safety'
};

const CATEGORY_DESCRIPTIONS = {
  agriculture: 'Agricultural knowledge including pest control and crop care',
  health: 'Health information including medicine and treatment guidelines',
  safety: 'Safety awareness including scam warnings and fraud prevention'
};

const CATEGORY_FOLDERS = {
  agriculture: 'knowledge/agriculture/',
  health: 'knowledge/health/',
  safety: 'knowledge/safety/'
};

const VALID_CATEGORIES = Object.values(CATEGORIES);

module.exports = {
  CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_FOLDERS,
  VALID_CATEGORIES
};
