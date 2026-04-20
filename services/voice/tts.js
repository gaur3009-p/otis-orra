require('dotenv').config();
const { logger } = require('@orra/shared');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_IDS = {
  alloy:    'EXAVITQu4vr4xnSDxMaL',
  echo:     'VR6AewLTigWG4xSOukaG',
  fable:    'pNInz6obpgDQGcFmaJgB',
  onyx:     'yoZ06aMxZJJ28mfd3POQ',
  nova:     'Xb7hH8MSUJpSbSDYk0k2',
  shimmer:  'jsCqWAovK2LkecY7zXl4',
};

async function textToSpeech(text, voiceId = 'nova') {
  const elevenVoiceId = ELEVENLABS_VOICE_IDS[voiceId] || ELEVENLABS_VOICE_IDS.nova;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.8 },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs error: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    logger.error(`TTS failed: ${err.message}`);
    throw err;
  }
}

module.exports = { textToSpeech };
