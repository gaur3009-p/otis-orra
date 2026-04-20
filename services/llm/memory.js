// In-memory + Redis session memory manager
require('dotenv').config();
const Redis = require('ioredis');
const { logger } = require('@orra/shared');

let redis;
function getRedis() {
  if (!redis) redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  return redis;
}

const SESSION_TTL = 60 * 60; // 1 hour

async function getHistory(sessionId) {
  try {
    const r = getRedis();
    const data = await r.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    logger.warn(`Redis get failed: ${err.message}`);
    return [];
  }
}

async function appendMessage(sessionId, role, content) {
  try {
    const r = getRedis();
    const history = await getHistory(sessionId);
    history.push({ role, content });
    // Keep last 20 messages
    const trimmed = history.slice(-20);
    await r.setex(`session:${sessionId}`, SESSION_TTL, JSON.stringify(trimmed));
    return trimmed;
  } catch (err) {
    logger.warn(`Redis set failed: ${err.message}`);
    return [{ role, content }];
  }
}

async function clearSession(sessionId) {
  try {
    const r = getRedis();
    await r.del(`session:${sessionId}`);
  } catch (err) {
    logger.warn(`Redis del failed: ${err.message}`);
  }
}

module.exports = { getHistory, appendMessage, clearSession };
