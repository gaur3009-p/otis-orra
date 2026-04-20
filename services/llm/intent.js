require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function classifyIntent(message) {
  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
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
