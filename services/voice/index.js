require('dotenv').config();
const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const axios = require('axios');
const { createASRStream } = require('./asr');
const { textToSpeech } = require('./tts');
const { logger } = require('@orra/shared');

const app = express();
app.use(express.json());
app.get('/health', (_, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/voice' });

const LLM_URL = process.env.LLM_SERVICE_URL || 'http://localhost:3003';

wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.replace('/voice?', ''));
  const sessionId = params.get('sessionId');
  const businessId = params.get('businessId');
  let assistantConfig = {};
  let pageContext = {};

  logger.info(`WS connected: session=${sessionId}`);

  let asr = createASRStream(
    async (transcript) => {
      logger.info(`Transcript: "${transcript}" [session=${sessionId}]`);
      ws.send(JSON.stringify({ type: 'transcript', text: transcript }));

      try {
        const { data } = await axios.post(`${LLM_URL}/respond`, {
          sessionId, userMessage: transcript, businessId, assistantConfig, pageContext,
        });

        const { reply, intent } = data;
        ws.send(JSON.stringify({ type: 'reply_text', text: reply, intent }));

        // TTS
        const audioBuffer = await textToSpeech(reply, assistantConfig.voice || 'nova');
        const base64Audio = audioBuffer.toString('base64');
        ws.send(JSON.stringify({ type: 'audio', data: base64Audio, mimeType: 'audio/mpeg' }));

        // Trigger lead capture signal
        if (intent === 'high_intent' && assistantConfig.leadCapture) {
          ws.send(JSON.stringify({ type: 'lead_capture_trigger' }));
        }
      } catch (err) {
        logger.error(`Processing error: ${err.message}`);
        ws.send(JSON.stringify({ type: 'error', message: 'Processing failed' }));
      }
    },
    (err) => ws.send(JSON.stringify({ type: 'error', message: err.message }))
  );

  ws.on('message', (data) => {
    try {
      // Binary = audio chunk
      if (Buffer.isBuffer(data)) {
        asr.send(data);
        return;
      }
      const msg = JSON.parse(data.toString());
      if (msg.type === 'config') {
        assistantConfig = msg.assistantConfig || {};
        logger.info(`Config set for session ${sessionId}`);
      } else if (msg.type === 'context') {
        pageContext = msg.context || {};
      } else if (msg.type === 'text_message') {
        // Text fallback (no voice)
        asr.finish && asr.finish();
        // Re-use same pipeline with the text
        axios.post(`${LLM_URL}/respond`, {
          sessionId, userMessage: msg.text, businessId, assistantConfig, pageContext,
        }).then(async ({ data }) => {
          const { reply, intent } = data;
          ws.send(JSON.stringify({ type: 'reply_text', text: reply, intent }));
          const audioBuffer = await textToSpeech(reply, assistantConfig.voice || 'nova');
          ws.send(JSON.stringify({ type: 'audio', data: audioBuffer.toString('base64'), mimeType: 'audio/mpeg' }));
          if (intent === 'high_intent' && assistantConfig.leadCapture) {
            ws.send(JSON.stringify({ type: 'lead_capture_trigger' }));
          }
        }).catch(err => {
          logger.error(`Text message error: ${err.message}`);
          ws.send(JSON.stringify({ type: 'error', message: 'Processing failed' }));
        });
      }
    } catch {
      // Binary audio data passed directly
      asr.send(data);
    }
  });

  ws.on('close', () => {
    logger.info(`WS closed: session=${sessionId}`);
    try { asr.finish(); } catch {}
  });

  ws.on('error', (err) => {
    logger.error(`WS error: ${err.message}`);
  });
});

const PORT = process.env.VOICE_PORT || 3001;
server.listen(PORT, () => logger.info(`Voice service (HTTP+WS) running on :${PORT}`));
