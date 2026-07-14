require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const express = require('express');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { prisma } = require('@orra/db');
const { requireAuth, signToken } = require('../middleware/auth');
const { generateApiKey } = require('@orra/shared');

const router = express.Router();

const RETRIEVAL_URL = process.env.RETRIEVAL_SERVICE_URL || 'http://localhost:3002';

// POST /business/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const existing = await prisma.business.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const apiKey = generateApiKey();
    const business = await prisma.business.create({
      data: { name, email, apiKey, passwordHash: hashed },
    });
    const token = signToken({ businessId: business.id, email: business.email, name: business.name });
    res.json({ token, business: { id: business.id, name: business.name, email: business.email, apiKey: business.apiKey } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /business/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const business = await prisma.business.findUnique({ where: { email } });
    if (!business) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, business.passwordHash || '');
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ businessId: business.id, email: business.email, name: business.name });
    res.json({ token, business: { id: business.id, name: business.name, email: business.email, apiKey: business.apiKey } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /business/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const business = await prisma.business.findUnique({
      where: { id: req.businessId },
      include: { assistants: true },
    });
    res.json(business);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /business/assistant — create or update assistant + trigger crawl
router.post('/assistant', requireAuth, async (req, res) => {
  const { name, voice, tone, websiteUrl, leadCapture } = req.body;
  if (!websiteUrl) return res.status(400).json({ error: 'websiteUrl required' });
  try {
    let assistant = await prisma.assistant.findFirst({ where: { businessId: req.businessId } });
    if (assistant) {
      assistant = await prisma.assistant.update({
        where: { id: assistant.id },
        data: { name, voice, tone, websiteUrl, leadCapture: leadCapture ?? true, crawlStatus: 'crawling' },
      });
    } else {
      assistant = await prisma.assistant.create({
        data: { businessId: req.businessId, name, voice, tone, websiteUrl, leadCapture: leadCapture ?? true, crawlStatus: 'crawling' },
      });
    }

    // Trigger crawl in background
    axios.post(`${RETRIEVAL_URL}/crawl`, { websiteUrl, businessId: req.businessId })
      .then(async (crawlRes) => {
        // Always mark done — if site was private/blocked, retrieval service
        // preserved existing knowledge base and returned early
        await prisma.assistant.update({ where: { id: assistant.id }, data: { crawlStatus: 'done' } });
      })
      .catch(async (err) => {
        console.error('Crawl request failed:', err.message);
        await prisma.assistant.update({ where: { id: assistant.id }, data: { crawlStatus: 'error' } });
      });

    res.json({ assistant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /business/assistant
router.get('/assistant', requireAuth, async (req, res) => {
  try {
    const assistant = await prisma.assistant.findFirst({ where: { businessId: req.businessId } });
    res.json({ assistant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /business/leads
router.get('/leads', requireAuth, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  try {
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where: { businessId: req.businessId },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.lead.count({ where: { businessId: req.businessId } }),
    ]);
    res.json({ leads, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /business/stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [totalLeads, totalConversations, recentLeads] = await Promise.all([
      prisma.lead.count({ where: { businessId: req.businessId } }),
      prisma.conversation.count({ where: { assistant: { businessId: req.businessId } } }),
      prisma.lead.count({
        where: { businessId: req.businessId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);
    res.json({ totalLeads, totalConversations, recentLeads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /business/knowledge-base
router.get('/knowledge-base', requireAuth, async (req, res) => {
  try {
    const pages = await prisma.websiteData.findMany({
      where: { businessId: req.businessId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ pages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /business/custom-content
router.post('/custom-content', requireAuth, async (req, res) => {
  const { title, content, url } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });

  try {
    let assistant = await prisma.assistant.findFirst({ where: { businessId: req.businessId } });
    if (!assistant) {
      assistant = await prisma.assistant.create({
        data: {
          businessId: req.businessId,
          name: 'Orra',
          voice: 'nova',
          tone: 'friendly',
          websiteUrl: url || 'https://custom-import.local',
          crawlStatus: 'crawling'
        }
      });
    } else {
      assistant = await prisma.assistant.update({
        where: { id: assistant.id },
        data: { crawlStatus: 'crawling' }
      });
    }

    axios.post(`${RETRIEVAL_URL}/custom-content`, {
      title,
      content,
      url,
      businessId: req.businessId
    })
      .then(() => prisma.assistant.update({ where: { id: assistant.id }, data: { crawlStatus: 'done' } }))
      .catch((err) => {
        console.error('Custom content indexing failed:', err.message);
        prisma.assistant.update({ where: { id: assistant.id }, data: { crawlStatus: 'error' } });
      });

    res.json({ success: true, assistant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /business/knowledge-base/:id
router.delete('/knowledge-base/:id', requireAuth, async (req, res) => {
  try {
    const page = await prisma.websiteData.findFirst({
      where: { id: req.params.id, businessId: req.businessId }
    });
    if (!page) return res.status(404).json({ error: 'Page not found' });

    await prisma.websiteData.delete({ where: { id: page.id } });

    const assistant = await prisma.assistant.findFirst({ where: { businessId: req.businessId } });
    if (assistant) {
      await prisma.assistant.update({
        where: { id: assistant.id },
        data: { crawlStatus: 'crawling' }
      });
    }

    axios.post(`${RETRIEVAL_URL}/sync`, { businessId: req.businessId })
      .then(() => {
        if (assistant) prisma.assistant.update({ where: { id: assistant.id }, data: { crawlStatus: 'done' } });
      })
      .catch(err => {
        console.error(`Sync after delete failed: ${err.message}`);
        if (assistant) prisma.assistant.update({ where: { id: assistant.id }, data: { crawlStatus: 'error' } });
      });

    res.json({ success: true, message: 'Page deleted and sync triggered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
