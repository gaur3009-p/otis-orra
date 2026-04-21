// npm install whisper-node
const { whisper } = require('whisper-node');
const fs = require('fs');
const path = require('path');
const { logger } = require('@orra/shared');

// whisper-node works on audio files, so we buffer the WebSocket chunks
// into a temp WAV file and transcribe on silence detection

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

    const tmpFile = path.join('/tmp', `orra_${Date.now()}.wav`);
    try {
      fs.writeFileSync(tmpFile, audioBuffer);

      const result = await whisper(tmpFile, {
        modelName: 'base.en',      // tiny.en = faster, base.en = better accuracy
        whisperOptions: {
          language: 'auto',
          word_timestamps: false,
        },
      });

      const transcript = result.map(r => r.speech).join(' ').trim();
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
