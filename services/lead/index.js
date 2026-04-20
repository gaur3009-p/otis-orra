require('dotenv').config();
const express = require('express');
const { saveLead, getLeads } = require('./capture');
const { notifyBusinessOwner } = require('./notify');
const { prisma } = require('@orra/db');
const { logger } = require('@orra/shared');

const app = express();
app.use(express.json());

// POST /leads — save a new lead
app.post('/leads', async (req, res) => {
  const { businessId, conversationId, name, email, phone, intent, queryContext } = req.body;
  if (!businessId) return res.status(400).json({ error: 'businessId required' });
  try {
    const lead = await saveLead({ businessId, conversationId, name, email, phone, intent, queryContext });

    // Send async notification
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (business) notifyBusinessOwner({ businessEmail: business.email, lead }).catch(() => {});

    res.json({ success: true, lead });
  } catch (err) {
    logger.error(`Save lead error: ${err.message}`);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

// GET /leads/:businessId — list leads
app.get('/leads/:businessId', async (req, res) => {
  const { businessId } = req.params;
  const { page, limit } = req.query;
  try {
    const result = await getLeads(businessId, { page: parseInt(page || '1'), limit: parseInt(limit || '20') });
    res.json(result);
  } catch (err) {
    logger.error(`Get leads error: ${err.message}`);
    res.status(500).json({ error: 'Failed to get leads' });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.LEAD_PORT || 3004;
app.listen(PORT, () => logger.info(`Lead service running on :${PORT}`));
