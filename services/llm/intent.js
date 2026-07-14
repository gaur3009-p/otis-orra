require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

async function classifyIntent(message) {
  const res = await openai.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    max_tokens: 10,
    messages: [
      {
        role: 'system',
        content: `Classify user message intent. Reply with ONLY one word: "high_intent" or "explore".
high_intent: user wants to buy, sign up, get a quote, book, contact, pricing, demo, trial.
explore: user is browsing, asking general questions, learning.`,
      },
      { role: 'user', content: message },
    ],
  });
  const text = res.choices[0].message.content.trim().toLowerCase();
  return text.includes('high') ? 'high_intent' : 'explore';
}

module.exports = { classifyIntent };
