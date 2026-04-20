function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    #orra-widget * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    #orra-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 999999;
      width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      box-shadow: 0 4px 24px rgba(99,102,241,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #orra-btn:hover { transform: scale(1.08); box-shadow: 0 6px 32px rgba(99,102,241,0.55); }
    #orra-btn.listening { animation: orra-pulse 1.4s infinite; }
    @keyframes orra-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.5); }
      50% { box-shadow: 0 0 0 16px rgba(99,102,241,0); }
    }
    #orra-panel {
      position: fixed; bottom: 96px; right: 24px; z-index: 999998;
      width: 340px; background: #fff; border-radius: 20px;
      box-shadow: 0 8px 48px rgba(0,0,0,0.18); overflow: hidden;
      transform: scale(0.92) translateY(20px); opacity: 0; pointer-events: none;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    #orra-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
    #orra-header {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      padding: 16px 20px; display: flex; align-items: center; gap: 12px;
    }
    #orra-avatar {
      width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.25);
      display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    #orra-header-text h3 { margin: 0; color: #fff; font-size: 15px; font-weight: 600; }
    #orra-header-text p { margin: 0; color: rgba(255,255,255,0.75); font-size: 12px; }
    #orra-messages {
      height: 240px; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .orra-msg { max-width: 80%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.4; }
    .orra-msg.user { align-self: flex-end; background: #6366f1; color: #fff; border-bottom-right-radius: 4px; }
    .orra-msg.bot { align-self: flex-start; background: #f3f4f6; color: #111; border-bottom-left-radius: 4px; }
    .orra-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }
    .orra-typing span { width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: orra-bounce 1.2s infinite; }
    .orra-typing span:nth-child(2) { animation-delay: 0.2s; }
    .orra-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes orra-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
    #orra-controls { padding: 12px 16px; border-top: 1px solid #f3f4f6; display: flex; gap: 8px; align-items: center; }
    #orra-text-input {
      flex: 1; border: 1px solid #e5e7eb; border-radius: 24px;
      padding: 8px 16px; font-size: 14px; outline: none;
      transition: border-color 0.2s;
    }
    #orra-text-input:focus { border-color: #6366f1; }
    #orra-mic-btn, #orra-send-btn {
      width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; font-size: 16px;
      transition: background 0.2s;
    }
    #orra-mic-btn { background: #f3f4f6; }
    #orra-mic-btn.active { background: #fee2e2; }
    #orra-send-btn { background: #6366f1; color: #fff; }
    #orra-lead-form { padding: 16px; background: #fafafa; border-top: 1px solid #f3f4f6; }
    #orra-lead-form h4 { margin: 0 0 12px; font-size: 14px; color: #374151; }
    #orra-lead-form input {
      width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px;
      font-size: 13px; margin-bottom: 8px; outline: none;
    }
    #orra-lead-form button {
      width: 100%; padding: 10px; background: #6366f1; color: #fff;
      border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 500;
    }
    #orra-waveform { display: flex; align-items: center; gap: 2px; height: 24px; }
    #orra-waveform span {
      width: 3px; background: rgba(255,255,255,0.8); border-radius: 2px;
      height: 4px; animation: orra-wave 1s infinite;
    }
    #orra-waveform span:nth-child(2){animation-delay:0.1s} #orra-waveform span:nth-child(3){animation-delay:0.2s}
    #orra-waveform span:nth-child(4){animation-delay:0.3s} #orra-waveform span:nth-child(5){animation-delay:0.4s}
    @keyframes orra-wave { 0%,100%{height:4px} 50%{height:18px} }
  `;
  document.head.appendChild(style);
}

function createWidget(config) {
  injectStyles();
  const root = document.createElement('div');
  root.id = 'orra-widget';
  root.innerHTML = `
    <div id="orra-panel">
      <div id="orra-header">
        <div id="orra-avatar">🤖</div>
        <div id="orra-header-text">
          <h3>${config.assistantName || 'Orra'}</h3>
          <p>AI Assistant • Online</p>
        </div>
      </div>
      <div id="orra-messages">
        <div class="orra-msg bot">Hi! I'm ${config.assistantName || 'Orra'}. Ask me anything about this website 👋</div>
      </div>
      <div id="orra-controls">
        <input id="orra-text-input" type="text" placeholder="Type a message..." />
        <button id="orra-mic-btn" title="Voice input">🎤</button>
        <button id="orra-send-btn" title="Send">➤</button>
      </div>
    </div>
    <button id="orra-btn" title="Chat with AI">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
  `;
  document.body.appendChild(root);

  return {
    panel: document.getElementById('orra-panel'),
    btn: document.getElementById('orra-btn'),
    messages: document.getElementById('orra-messages'),
    micBtn: document.getElementById('orra-mic-btn'),
    sendBtn: document.getElementById('orra-send-btn'),
    textInput: document.getElementById('orra-text-input'),
  };
}

function addMessage(messagesEl, text, role) {
  const msg = document.createElement('div');
  msg.className = `orra-msg ${role}`;
  msg.textContent = text;
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showTyping(messagesEl) {
  const el = document.createElement('div');
  el.className = 'orra-msg bot orra-typing-wrapper';
  el.innerHTML = '<div class="orra-typing"><span></span><span></span><span></span></div>';
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

function showLeadForm(messagesEl, onSubmit) {
  const existing = document.getElementById('orra-lead-form');
  if (existing) return;
  const form = document.createElement('div');
  form.id = 'orra-lead-form';
  form.innerHTML = `
    <h4>Want us to follow up? Drop your details 👇</h4>
    <input id="orra-lead-name" type="text" placeholder="Your name" />
    <input id="orra-lead-email" type="email" placeholder="Email address" />
    <button id="orra-lead-submit">Send my details</button>
  `;
  messagesEl.parentElement.appendChild(form);
  document.getElementById('orra-lead-submit').addEventListener('click', () => {
    const name = document.getElementById('orra-lead-name').value;
    const email = document.getElementById('orra-lead-email').value;
    onSubmit({ name, email });
    form.innerHTML = '<p style="color:#10b981;font-size:14px;text-align:center;padding:8px">✅ Thanks! We\'ll be in touch soon.</p>';
    setTimeout(() => form.remove(), 3000);
  });
}

module.exports = { createWidget, addMessage, showTyping, showLeadForm };
