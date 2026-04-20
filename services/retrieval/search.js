require('dotenv').config();
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
let index;

async function getIndex() {
  if (!index) {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    index = pc.index(process.env.PINECONE_INDEX || 'orra-website');
  }
  return index;
}

async function searchChunks(query, namespace, topK = 5) {
  const idx = await getIndex();

  const embRes = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  const queryEmbedding = embRes.data[0].embedding;

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
