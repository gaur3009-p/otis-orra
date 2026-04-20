const { logger } = require('./logger');

const VOICE_OPTIONS = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
const TONE_OPTIONS = ['friendly', 'professional', 'premium', 'casual', 'technical'];

const generateApiKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return 'orra_' + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const sanitizeUrl = (url) => {
  if (!url.startsWith('http')) url = 'https://' + url;
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url;
  }
};

module.exports = { logger, VOICE_OPTIONS, TONE_OPTIONS, generateApiKey, sanitizeUrl };
