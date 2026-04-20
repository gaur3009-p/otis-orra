require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const businessRoutes = require('./routes/business');
const widgetRoutes = require('./routes/widget');
const { logger } = require('@orra/shared');

const app = express();

app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Too many requests' } });
app.use(limiter);

app.use('/business', businessRoutes);
app.use('/widget', widgetRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'api-gateway' }));

app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.API_GATEWAY_PORT || 3000;
app.listen(PORT, () => logger.info(`API Gateway running on :${PORT}`));
