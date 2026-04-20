require('dotenv').config();
const OpenAI = require('openai');
const axios = require('axios');
const { buildSystemPrompt } = require('./prompts');
const { getHistory, appendMessage } = require('./memory');
const { classifyIntent } = require('./intent');
const { logger } = require('@orra/shared');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
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
