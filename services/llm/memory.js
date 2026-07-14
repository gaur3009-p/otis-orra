require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const Redis = require('ioredis');
const { logger } = require('@orra/shared');
const { prisma } = require('@orra/db');

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

async function appendMessage(sessionId, role, content, businessId = null) {
  try {
    const r = getRedis();
    const history = await getHistory(sessionId);
    history.push({ role, content });
    // Keep last 20 messages
    const trimmed = history.slice(-20);
    await r.setex(`session:${sessionId}`, SESSION_TTL, JSON.stringify(trimmed));

    // Persist to Postgres Conversation
    try {
      let conv = await prisma.conversation.findUnique({ where: { sessionId } });
      if (!conv && businessId) {
        const assistant = await prisma.assistant.findFirst({ where: { businessId } });
        if (assistant) {
          conv = await prisma.conversation.create({
            data: { assistantId: assistant.id, sessionId, messages: [], context: {} }
          });
        }
      }
      if (conv) {
        const dbMessages = Array.isArray(conv.messages) ? conv.messages : [];
        dbMessages.push({ role, content, createdAt: new Date() });
        await prisma.conversation.update({
          where: { sessionId },
          data: { messages: dbMessages }
        });
      }
    } catch (dbErr) {
      logger.warn(`Failed to persist message to Postgres: ${dbErr.message}`);
    }

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
