require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const OpenAI = require('openai');
const axios = require('axios');
const { buildSystemPrompt } = require('./prompts');
const { getHistory, appendMessage } = require('./memory');
const { classifyIntent } = require('./intent');
const { logger } = require('@orra/shared');

// ── GROQ STACK ──────────────────────────────────────────────────────────────     ──
// Initialize OpenAI client pointed to Groq's OpenAI-compatible API
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const RETRIEVAL_URL = process.env.RETRIEVAL_SERVICE_URL || 'http://localhost:3002';

async function getRetrievedChunks(query, businessId) {
  try {
    const { data } = await axios.post(`${RETRIEVAL_URL}/search`, { query, businessId, topK: 5 });
    return data.results || [];
  } catch (err) {
    logger.warn(`Retrieval failed: ${err.message}`);
    return [];
  }
}

async function runLLM({ sessionId, userMessage, businessId, assistantConfig, pageContext }) {
  const { name: assistantName, tone, websiteUrl } = assistantConfig;

  const [history, retrievedChunks, intent] = await Promise.all([
    getHistory(sessionId),
    getRetrievedChunks(userMessage, businessId),
    classifyIntent(userMessage),
  ]);

  const systemPrompt = buildSystemPrompt({ assistantName, tone, websiteUrl, retrievedChunks, pageContext });

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const completion = await openai.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    messages,
    max_tokens: 200,
    temperature: 0.7,
    stream: false,
  });

  const assistantReply = completion.choices[0].message.content;

  await appendMessage(sessionId, 'user', userMessage, businessId);
  await appendMessage(sessionId, 'assistant', assistantReply, businessId);

  return { reply: assistantReply, intent, retrievedChunks };
}

module.exports = { runLLM };
