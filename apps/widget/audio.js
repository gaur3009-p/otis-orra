class AudioCapture {
  constructor(onChunk, onError) {
    this.onChunk = onChunk;
    this.onError = onError;
    this.mediaRecorder = null;
    this.stream = null;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'audio/webm;codecs=opus' });
      this.mediaRecorder.addEventListener('dataavailable', (e) => {
        if (e.data.size > 0) {
          e.data.arrayBuffer().then(buf => this.onChunk(buf));
        }
      });
      this.mediaRecorder.start(250); // 250ms chunks
      return true;
    } catch (err) {
      this.onError(err);
      return false;
    }
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
    }
    this.mediaRecorder = null;
    this.stream = null;
  }
}

class AudioPlayer {
  constructor() {
    this.queue = [];
    this.playing = false;
  }

  async play(base64Audio, mimeType = 'audio/mpeg') {
    this.queue.push({ base64Audio, mimeType });
    if (!this.playing) this._playNext();
  }

  async _playNext() {
    if (this.queue.length === 0) { this.playing = false; return; }
    this.playing = true;
    const { base64Audio, mimeType } = this.queue.shift();
    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => { URL.revokeObjectURL(url); this._playNext(); };
    audio.onerror = () => { URL.revokeObjectURL(url); this._playNext(); };
    await audio.play().catch(() => {});
  }
}

module.exports = { AudioCapture, AudioPlayer };
