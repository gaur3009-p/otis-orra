require('dotenv').config();
const express = require('express');
const { crawlWebsite } = require('./crawler');
const { chunkPages } = require('./chunker');
const { embedChunks } = require('./embedder');
const { searchChunks } = require('./search');
const { logger } = require('@orra/shared');

const app = express();
app.use(express.json());

// POST /crawl — trigger a website crawl + embed
app.post('/crawl', async (req, res) => {
  const { websiteUrl, businessId } = req.body;
  if (!websiteUrl || !businessId) return res.status(400).json({ error: 'websiteUrl and businessId required' });

  res.json({ status: 'crawling', message: 'Crawl started in background' });

  try {
    const pages = await crawlWebsite(websiteUrl);
    const chunks = chunkPages(pages);
    await embedChunks(chunks, businessId);
    logger.info(`Crawl complete for ${websiteUrl}, ${chunks.length} chunks embedded`);
  } catch (err) {
    logger.error(`Crawl failed: ${err.message}`);
  }
});

// POST /search — semantic search
app.post('/search', async (req, res) => {
  const { query, businessId, topK = 5 } = req.body;
  if (!query || !businessId) return res.status(400).json({ error: 'query and businessId required' });
  try {
    const results = await searchChunks(query, businessId, topK);
    res.json({ results });
  } catch (err) {
    logger.error(`Search failed: ${err.message}`);
    res.status(500).json({ error: 'Search failed' });
  }
});

const PORT = process.env.RETRIEVAL_PORT || 3002;
app.listen(PORT, () => logger.info(`Retrieval service running on :${PORT}`));
