const { prisma } = require('@orra/db');
const { logger } = require('@orra/shared');

async function saveLead({ businessId, conversationId, name, email, phone, intent, queryContext }) {
  try {
    const lead = await prisma.lead.create({
      data: { businessId, conversationId, name, email, phone, intent, queryContext },
    });
    logger.info(`Lead saved: ${lead.id} for business ${businessId}`);
    return lead;
  } catch (err) {
    logger.error(`Failed to save lead: ${err.message}`);
    throw err;
  }
}

async function getLeads(businessId, { page = 1, limit = 20 } = {}) {
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { conversation: { select: { sessionId: true } } },
    }),
    prisma.lead.count({ where: { businessId } }),
  ]);
  return { leads, total, page, limit, pages: Math.ceil(total / limit) };
}

module.exports = { saveLead, getLeads };
