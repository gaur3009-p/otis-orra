const jwt = require('jsonwebtoken');
const { prisma } = require('@orra/db');

const JWT_SECRET = process.env.JWT_SECRET || 'orra-dev-secret-change-in-prod';

// JWT auth for dashboard routes
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.businessId = decoded.businessId;
    req.business = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// API Key auth for widget routes
async function requireApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (!apiKey) return res.status(401).json({ error: 'No API key' });
  try {
    const business = await prisma.business.findUnique({ where: { apiKey } });
    if (!business) return res.status(401).json({ error: 'Invalid API key' });
    req.businessId = business.id;
    req.business = business;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Auth error' });
  }
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { requireAuth, requireApiKey, signToken };
