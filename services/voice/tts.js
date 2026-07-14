const { logger } = require('@orra/shared');

// ElevenLabs voice IDs mapped from standard options
const VOICE_MAP = {
  alloy: '21m00Tcm4TlvDq8ikWAM', // Rachel
  echo: 'AZnzlk1XyUDgxwfuz5yl', // Dom
  fable: 'EXAVITQu4vr4xnSDxMaL', // Bella
  onyx: 'ErXwobaYiN019PkySvjV', // Antoni
  nova: 'piTKgcLEGmPEe24241C2', // Nicole
  shimmer: 'jsCqZswCgpaGgV5exBup', // Freya
};

async function textToSpeech(text, voiceId = 'nova') {
  // Use configured ELEVENLABS_VOICE_ID or map the name, fallback to Rachel
  const selectedVoice = process.env.ELEVENLABS_VOICE_ID || VOICE_MAP[voiceId] || VOICE_MAP.nova;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not configured in .env');
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs TTS error (${response.status}): ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    logger.error(`TTS failed: ${err.message}`);
    throw err;
  }
}

module.exports = { textToSpeech };
