(function () {
  'use strict';

  const { getPageContext } = require('./context');
  const { AudioCapture, AudioPlayer } = require('./audio');
  const { createWidget, addMessage, showTyping, showLeadForm } = require('./ui');

  const script = document.currentScript || document.querySelector('script[data-id]');
  const CLIENT_ID = script?.getAttribute('data-id');
  const API_BASE = script?.getAttribute('data-api') || 'https://api.orra.ai';
  const WS_BASE = (script?.getAttribute('data-ws') || 'wss://voice.orra.ai').replace(/^http/, 'ws');

  if (!CLIENT_ID) { console.warn('[Orra] Missing data-id on script tag'); return; }

  let ws = null;
  let sessionId = null;
  let config = {};
  let isOpen = false;
  let isListening = false;

  const audioCapture = new AudioCapture(
    (chunk) => { if (ws?.readyState === WebSocket.OPEN) ws.send(chunk); },
    (err) => console.error('[Orra] Mic error:', err)
  );
  const audioPlayer = new AudioPlayer();

  async function init() {
    try {
      const res = await fetch(`${API_BASE}/widget/config?apiKey=${CLIENT_ID}`);
      if (!res.ok) throw new Error('Config fetch failed');
      config = await res.json();
    } catch (err) {
      console.error('[Orra] Init failed:', err.message);
      config = { assistantName: 'Orra', voice: 'nova', tone: 'friendly', leadCapture: true };
    }

    const ui = createWidget(config);

    ui.btn.addEventListener('click', () => togglePanel(ui));
    ui.micBtn.addEventListener('click', () => toggleMic(ui));
    ui.sendBtn.addEventListener('click', () => sendText(ui));
    ui.textInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendText(ui); });

    // Context updates on scroll/nav
    window.addEventListener('scroll', () => sendContext(), { passive: true });
    window.addEventListener('popstate', () => sendContext());
  }

  async function openSession(ui) {
    try {
      const res = await fetch(`${API_BASE}/widget/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': CLIENT_ID },
      });
      const data = await res.json();
      sessionId = data.sessionId;
      connectWebSocket(ui);
    } catch (err) {
      console.error('[Orra] Session init failed:', err.message);
    }
  }

  function connectWebSocket(ui) {
    const url = `${WS_BASE}/voice?sessionId=${sessionId}&businessId=${config.businessId}`;
    ws = new WebSocket(url);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'config', assistantConfig: config }));
      sendContext();
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'transcript') {
        addMessage(ui.messages, msg.text, 'user');
      } else if (msg.type === 'reply_text') {
        const typing = document.querySelector('.orra-typing-wrapper');
        if (typing) typing.remove();
        addMessage(ui.messages, msg.text, 'bot');
      } else if (msg.type === 'audio') {
        await audioPlayer.play(msg.data, msg.mimeType);
      } else if (msg.type === 'lead_capture_trigger') {
        showLeadForm(ui.messages, (leadData) => submitLead(leadData));
      } else if (msg.type === 'error') {
        const typing = document.querySelector('.orra-typing-wrapper');
        if (typing) typing.remove();
        addMessage(ui.messages, 'Sorry, something went wrong. Please try again.', 'bot');
      }
    };

    ws.onclose = () => { ws = null; };
    ws.onerror = () => { ws = null; };
  }

  function sendContext() {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'context', context: getPageContext() }));
    }
  }

  async function sendText(ui) {
    const text = ui.textInput.value.trim();
    if (!text) return;
    ui.textInput.value = '';

    if (!sessionId) await openSession(ui);

    addMessage(ui.messages, text, 'user');
    showTyping(ui.messages);

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'text_message', text }));
    }
  }

  async function toggleMic(ui) {
    if (!sessionId) await openSession(ui);

    if (!isListening) {
      const started = await audioCapture.start();
      if (started) {
        isListening = true;
        ui.micBtn.classList.add('active');
        ui.micBtn.textContent = '⏹';
        ui.btn.classList.add('listening');
        showTyping(ui.messages);
      }
    } else {
      audioCapture.stop();
      isListening = false;
      ui.micBtn.classList.remove('active');
      ui.micBtn.textContent = '🎤';
      ui.btn.classList.remove('listening');
    }
  }

  function togglePanel(ui) {
    isOpen = !isOpen;
    ui.panel.classList.toggle('open', isOpen);
    if (isOpen && !sessionId) openSession(ui);
  }

  async function submitLead(leadData) {
    try {
      await fetch(`${API_BASE}/widget/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': CLIENT_ID },
        body: JSON.stringify({ ...leadData, sessionId }),
      });
    } catch (err) {
      console.error('[Orra] Lead submit failed:', err.message);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
