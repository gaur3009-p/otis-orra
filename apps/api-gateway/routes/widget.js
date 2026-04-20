const express = require('express');
const { prisma } = require('@orra/db');
const { requireApiKey } = require('../middleware/auth');

const router = express.Router();

// GET /widget/config?apiKey=xxx — called by widget on load
router.get('/config', requireApiKey, async (req, res) => {
  try {
    const assistant = await prisma.assistant.findFirst({
      where: { businessId: req.businessId },
    });
    if (!assistant) return res.status(404).json({ error: 'No assistant configured' });
    res.json({
      assistantName: assistant.name,
      voice: assistant.voice,
      tone: assistant.tone,
      leadCapture: assistant.leadCapture,
      businessId: req.businessId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /widget/session — init a new conversation session
router.post('/session', requireApiKey, async (req, res) => {
  try {
    const assistant = await prisma.assistant.findFirst({ where: { businessId: req.businessId } });
    if (!assistant) return res.status(404).json({ error: 'No assistant configured' });

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await prisma.conversation.create({
      data: { assistantId: assistant.id, sessionId, messages: [], context: {} },
    });
    res.json({ sessionId, businessId: req.businessId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /widget/lead — capture lead from widget
router.post('/lead', requireApiKey, async (req, res) => {
  const { sessionId, name, email, phone, intent, queryContext } = req.body;
  try {
    const conversation = sessionId
      ? await prisma.conversation.findUnique({ where: { sessionId } })
      : null;

    const lead = await prisma.lead.create({
      data: {
        businessId: req.businessId,
        conversationId: conversation?.id,
        name, email, phone, intent, queryContext,
      },
    });
    res.json({ success: true, leadId: lead.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
