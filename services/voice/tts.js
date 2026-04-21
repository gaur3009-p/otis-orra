// No npm package needed — Kokoro runs as a local HTTP server (Docker)
// KOKORO_URL=http://localhost:8300 in your .env

const { logger } = require('@orra/shared');

// Kokoro voice IDs (26 voices available)
const VOICE_MAP = {
  alloy:   'af_alloy',
  echo:    'am_echo',
  fable:   'bf_emma',
  onyx:    'am_onyx',
  nova:    'af_nova',
  shimmer: 'af_shimmer',
};

async function textToSpeech(text, voiceId = 'nova') {
  const kokoroVoice = VOICE_MAP[voiceId] || VOICE_MAP.nova;
  const kokoroUrl = process.env.KOKORO_URL || 'http://localhost:8300';

  try {
    const response = await fetch(`${kokoroUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: kokoroVoice,
        speed: 1.0,
      }),
    });

    if (!response.ok) throw new Error(`Kokoro TTS error: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    logger.error(`TTS failed: ${err.message}`);
    throw err;
  }
}

module.exports = { textToSpeech };
