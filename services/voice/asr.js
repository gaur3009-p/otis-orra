require('dotenv').config();
const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');
const { logger } = require('@orra/shared');

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

function createASRStream(onTranscript, onError) {
  const live = deepgram.listen.live({
    model: 'nova-2',
    language: 'en-US',
    smart_format: true,
    interim_results: false,
    utterance_end_ms: 1000,
    vad_events: true,
  });

  live.on(LiveTranscriptionEvents.Open, () => {
    logger.info('Deepgram ASR connection open');
  });

  live.on(LiveTranscriptionEvents.Transcript, (data) => {
    const transcript = data.channel?.alternatives?.[0]?.transcript;
    if (transcript && transcript.trim() && data.is_final) {
      onTranscript(transcript.trim());
    }
  });

  live.on(LiveTranscriptionEvents.Error, (err) => {
    logger.error(`ASR error: ${err.message}`);
    onError(err);
  });

  live.on(LiveTranscriptionEvents.Close, () => {
    logger.info('Deepgram ASR connection closed');
  });

  return {
    send: (audioChunk) => live.send(audioChunk),
    finish: () => live.finish(),
  };
}

module.exports = { createASRStream };
