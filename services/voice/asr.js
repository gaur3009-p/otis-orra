require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { logger } = require('@orra/shared');

// Initialize OpenAI client pointed to Groq's OpenAI-compatible API
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// whisper-node is replaced by Groq's fast cloud-based Whisper API.
// We buffer the WebSocket chunks into a temp WebM file and transcribe on silence detection.

class WhisperASR {
  constructor(onTranscript, onError) {
    this.onTranscript = onTranscript;
    this.onError = onError;
    this.chunks = [];
    this.silenceTimer = null;
    this.SILENCE_MS = 1200; // transcribe after 1.2s of no new audio
  }

  send(audioChunk) {
    this.chunks.push(Buffer.from(audioChunk));
    // Reset silence timer on every new chunk
    clearTimeout(this.silenceTimer);
    this.silenceTimer = setTimeout(() => this._transcribe(), this.SILENCE_MS);
  }

  async _transcribe() {
    if (this.chunks.length === 0) return;
    const audioBuffer = Buffer.concat(this.chunks);
    this.chunks = [];

    const tmpFile = path.join(os.tmpdir(), `orra_${Date.now()}.webm`);
    try {
      fs.writeFileSync(tmpFile, audioBuffer);

      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tmpFile),
        model: 'whisper-large-v3-turbo',
      });

      const transcript = transcription.text ? transcription.text.trim() : '';
      if (transcript) {
        logger.info(`Whisper transcript: "${transcript}"`);
        this.onTranscript(transcript);
      }
    } catch (err) {
      logger.error(`Whisper ASR error: ${err.message}`);
      this.onError(err);
    } finally {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }

  finish() {
    clearTimeout(this.silenceTimer);
    if (this.chunks.length > 0) this._transcribe();
  }
}

function createASRStream(onTranscript, onError) {
  const asr = new WhisperASR(onTranscript, onError);
  return {
    send: (chunk) => asr.send(chunk),
    finish: () => asr.finish(),
  };
}

module.exports = { createASRStream };
