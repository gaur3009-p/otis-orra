require('dotenv').config();
const express = require('express');
const { runLLM } = require('./engine');
const { logger } = require('@orra/shared');

const app = express();
app.use(express.json());

// POST /respond — main LLM endpoint
app.post('/respond', async (req, res) => {
  const { sessionId, userMessage, businessId, assistantConfig, pageContext } = req.body;
  if (!sessionId || !userMessage || !businessId || !assistantConfig) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await runLLM({ sessionId, userMessage, businessId, assistantConfig, pageContext });
    res.json(result);
  } catch (err) {
    logger.error(`LLM error: ${err.message}`);
    res.status(500).json({ error: 'LLM processing failed', details: err.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.LLM_PORT || 3003;
app.listen(PORT, () => logger.info(`LLM service running on :${PORT}`));
