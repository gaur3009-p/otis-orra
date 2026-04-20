require('dotenv').config();
const nodemailer = require('nodemailer');
const { logger } = require('@orra/shared');

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function notifyBusinessOwner({ businessEmail, lead }) {
  if (!process.env.SMTP_USER) {
    logger.warn('SMTP not configured, skipping email notification');
    return;
  }

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: `"Orra" <${process.env.SMTP_USER}>`,
      to: businessEmail,
      subject: `🎯 New Lead Captured — ${lead.name || 'Anonymous'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">New Lead from Orra</h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Name</strong></td><td>${lead.name || '—'}</td></tr>
            <tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Email</strong></td><td>${lead.email || '—'}</td></tr>
            <tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Phone</strong></td><td>${lead.phone || '—'}</td></tr>
            <tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Intent</strong></td><td>${lead.intent || '—'}</td></tr>
            <tr><td style="padding:8px;"><strong>Context</strong></td><td>${lead.queryContext || '—'}</td></tr>
          </table>
          <p style="color:#888; font-size:12px; margin-top:24px;">Powered by Orra — AI Voice Infrastructure</p>
        </div>`,
    });
    logger.info(`Lead notification sent to ${businessEmail}`);
  } catch (err) {
    logger.error(`Email notification failed: ${err.message}`);
  }
}

module.exports = { notifyBusinessOwner };
