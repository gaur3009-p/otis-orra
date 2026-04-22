require('dotenv').config();
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { logger } = require('@orra/shared');

const openai = new OpenAI({
  baseURL: `${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/v1`,
  apiKey: 'ollama',
});

let pinecone;
let index;

async function getPineconeIndex() {
  if (!index) {
    pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    index = pinecone.index(process.env.PINECONE_INDEX || 'orra-website');
  }
  return index;
}

async function embedChunks(chunks, namespace) {
  const idx = await getPineconeIndex();
  const batchSize = 50;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map(c => c.text);

    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    });

    const vectors = batch.map((chunk, j) => ({
      id: chunk.id,
      values: embeddingRes.data[j].embedding,
      metadata: { ...chunk.metadata, text: chunk.text },
    }));

    await idx.namespace(namespace).upsert(vectors);
    logger.info(`Upserted batch ${i / batchSize + 1} to Pinecone namespace: ${namespace}`);
  }
}

module.exports = { embedChunks };
