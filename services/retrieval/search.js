require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

const { logger } = require('@orra/shared');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});
let index;

function getLocalEmbedding(text) {
  const vector = new Array(1024).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const index = (i * 31 + charCode) % 1024;
    vector[index] += charCode;
  }
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map(val => val / magnitude);
}

async function getIndex() {
  if (!index) {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    index = pc.index(process.env.PINECONE_INDEX || 'orra-website');
  }
  return index;
}

async function searchChunks(query, namespace, topK = 5) {
  const idx = await getIndex();

  let queryEmbedding;
  try {
    const embRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    queryEmbedding = embRes.data[0].embedding;
  } catch (err) {
    logger.warn(`Groq embedding failed, falling back to local deterministic embedding: ${err.message}`);
    queryEmbedding = getLocalEmbedding(query);
  }

  const results = await idx.namespace(namespace).query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return results.matches.map(m => ({
    text: m.metadata.text,
    url: m.metadata.url,
    title: m.metadata.title,
    score: m.score,
  }));
}

module.exports = { searchChunks };
