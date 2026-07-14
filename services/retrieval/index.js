require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const express = require('express');
const { crawlWebsite } = require('./crawler');
const { chunkPages } = require('./chunker');
const { embedChunks, syncPinecone, embedSinglePage } = require('./embedder');
const { searchChunks } = require('./search');
const { logger } = require('@orra/shared');
const { prisma } = require('@orra/db');

const app = express();
app.use(express.json());

// POST /crawl — trigger a website crawl + embed
app.post('/crawl', async (req, res) => {
  const { websiteUrl, businessId } = req.body;
  if (!websiteUrl || !businessId) return res.status(400).json({ error: 'websiteUrl and businessId required' });

  res.json({ status: 'crawling', message: 'Crawl started in background' });

  try {
    const pages = await crawlWebsite(websiteUrl);

    if (pages.length === 0) {
      // Site is private, blocked by JS rendering, or returned no content.
      // DO NOT delete existing knowledge base data — just log and exit.
      logger.warn(`Crawl of ${websiteUrl} returned 0 pages (private/blocked). Existing knowledge base preserved.`);
      return;
    }

    // Only delete previously crawled (non-custom) pages if we got fresh results
    await prisma.websiteData.deleteMany({
      where: {
        businessId,
        // Preserve pages that were manually imported via Inspect tab
        NOT: {
          url: {
            startsWith: 'https://custom-import.local'
          }
        }
      }
    });

    await prisma.websiteData.createMany({
      data: pages.map(p => ({
        businessId,
        url: p.url,
        title: p.title || 'Crawled Page',
        content: p.content
      }))
    });

    await syncPinecone(businessId);
    logger.info(`Crawl complete for ${websiteUrl} — ${pages.length} pages saved and Pinecone synced`);
  } catch (err) {
    logger.error(`Crawl failed: ${err.message}`);
  }
});

// POST /custom-content — embed custom Inspect/manual data
app.post('/custom-content', async (req, res) => {
  const { title, content, url, businessId } = req.body;
  if (!content || !businessId) return res.status(400).json({ error: 'content and businessId required' });

  res.json({ status: 'indexing', message: 'Custom content indexing started' });

  try {
    const isHtml = content.trim().startsWith('<') || content.includes('</');
    let pageContent = content;
    let pageTitle = title || 'Custom Content';
    const pageUrl = url || `https://custom-import.local/${Date.now()}`;

    if (isHtml) {
      const cheerio = require('cheerio');
      const $ = cheerio.load(content);
      $('script, style, nav, footer, header, .cookie-banner, #cookie-banner').remove();
      const extractedTitle = $('title').text().trim();
      const h1 = $('h1').first().text().trim();
      pageContent = $('main, article, .content, #content, body').first().text()
        .replace(/\s+/g, ' ').trim().slice(0, 5000);
      if (!title) {
        pageTitle = extractedTitle || h1 || 'Imported HTML page';
      }
    }

    if (!pageContent || pageContent.length < 20) {
      logger.warn(`Custom content for ${businessId} was too short after parsing, skipping index.`);
      return;
    }

    const saved = await prisma.websiteData.create({
      data: {
        businessId,
        url: pageUrl,
        title: pageTitle,
        content: pageContent
      }
    });

    // Additive upsert — only embed THIS page, no wipe of existing vectors
    await embedSinglePage(saved, businessId);
    logger.info(`Custom content "${pageTitle}" indexed into Pinecone for ${businessId}`);
  } catch (err) {
    logger.error(`Custom content indexing failed: ${err.message}`);
  }
});

// POST /sync — sync database and Pinecone for a business
app.post('/sync', async (req, res) => {
  const { businessId } = req.body;
  if (!businessId) return res.status(400).json({ error: 'businessId required' });
  try {
    await syncPinecone(businessId);
    res.json({ success: true, message: 'Pinecone synced with database' });
  } catch (err) {
    logger.error(`Sync failed for ${businessId}: ${err.message}`);
    res.status(500).json({ error: 'Sync failed', details: err.message });
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
