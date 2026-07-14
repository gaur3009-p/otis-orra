require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { logger } = require('@orra/shared');
const { prisma } = require('@orra/db');
const { chunkPages } = require('./chunker');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

let pinecone;
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

    let embeddings;
    try {
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
      });
      embeddings = embeddingRes.data.map(d => d.embedding);
    } catch (err) {
      logger.warn(`Groq embedding failed, falling back to local deterministic embeddings: ${err.message}`);
      embeddings = texts.map(text => getLocalEmbedding(text));
    }

    const vectors = batch.map((chunk, j) => ({
      id: chunk.id,
      values: embeddings[j],
      metadata: { ...chunk.metadata, text: chunk.text },
    }));

    await idx.namespace(namespace).upsert(vectors);
    logger.info(`Upserted batch ${i / batchSize + 1} to Pinecone namespace: ${namespace}`);
  }
}

async function syncPinecone(businessId) {
  const idx = await getPineconeIndex();
  
  try {
    await idx.namespace(businessId).deleteAll();
    logger.info(`Cleared Pinecone namespace: ${businessId}`);
  } catch (err) {
    logger.warn(`Failed to clear Pinecone namespace: ${err.message}`);
  }

  const pages = await prisma.websiteData.findMany({
    where: { businessId },
  });

  if (pages.length === 0) {
    logger.info(`No pages found in database for business ${businessId}. Namespace cleared.`);
    return;
  }

  const chunks = chunkPages(pages);
  await embedChunks(chunks, businessId);
  logger.info(`Synced ${pages.length} pages to Pinecone for business: ${businessId}`);
}

// Embed a single page's chunks and upsert into Pinecone without wiping other data
async function embedSinglePage(page, businessId) {
  const chunks = chunkPages([page]);
  if (chunks.length === 0) {
    logger.warn(`No chunks generated for page: ${page.url}`);
    return;
  }
  await embedChunks(chunks, businessId);
  logger.info(`Upserted ${chunks.length} chunks for page "${page.title}" into namespace: ${businessId}`);
}

module.exports = { embedChunks, syncPinecone, embedSinglePage };
