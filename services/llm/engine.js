require('dotenv').config();
const OpenAI = require('openai');
const axios = require('axios');
const { buildSystemPrompt } = require('./prompts');
const { getHistory, appendMessage } = require('./memory');
const { classifyIntent } = require('./intent');
const { logger } = require('@orra/shared');

// ── FREE STACK: Ollama instead of OpenAI ──────────────────────────────────────
// Ollama exposes an OpenAI-compatible API at /v1 — the SDK works unchanged.
// Set OLLAMA_BASE_URL in .env (default: http://localhost:11434)
const openai = new OpenAI({
  baseURL: `${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/v1`,
  apiKey: 'ollama', // Ollama ignores this but the SDK requires a non-empty string
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
    model: process.env.OLLAMA_MODEL || 'llama3.2', // ← was: 'gpt-4o-mini'
    messages,
    max_tokens: 200,
    temperature: 0.7,
    stream: false,
  });

  const assistantReply = completion.choices[0].message.content;

  await appendMessage(sessionId, 'user', userMessage);
  await appendMessage(sessionId, 'assistant', assistantReply);

  return { reply: assistantReply, intent, retrievedChunks };
}

module.exports = { runLLM };
