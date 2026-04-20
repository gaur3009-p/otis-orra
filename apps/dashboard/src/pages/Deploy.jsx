import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import api from '../api';

export default function Deploy() {
  const { auth } = useAuth();
  const [copied, setCopied] = useState('');
  const [assistant, setAssistant] = useState(null);

  useEffect(() => {
    api.get('/business/assistant').then(r => setAssistant(r.data.assistant)).catch(() => {});
  }, []);

  const apiKey = auth?.business?.apiKey || 'YOUR_API_KEY';
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.orra.ai';
  const wsUrl  = import.meta.env.VITE_WS_URL  || 'wss://voice.orra.ai';

  const snippetScript = `<script
  src="${apiUrl}/widget.js"
  data-id="${apiKey}"
  data-api="${apiUrl}"
  data-ws="${wsUrl}"
  async
></script>`;

  const snippetNPM = `// npm install @orra/widget
import { initOrra } from '@orra/widget';
initOrra({ clientId: '${apiKey}', apiUrl: '${apiUrl}', wsUrl: '${wsUrl}' });`;

  const snippetNextjs = `// pages/_app.js or app/layout.js
import Script from 'next/script';
export default function Layout({ children }) {
  return (
    <>
      {children}
      <Script
        src="${apiUrl}/widget.js"
        data-id="${apiKey}"
        data-api="${apiUrl}"
        data-ws="${wsUrl}"
        strategy="afterInteractive"
      />
    </>
  );
}`;

  function copy(text, id) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    });
  }

  const card = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' };
  const cardHeader = { padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };

  return (
    <div className="fade-in" style={{ padding: '40px 48px', maxWidth: 820, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.7px', marginBottom: 6 }}>Deploy</h1>
      <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 36 }}>Add your AI assistant to your website with one of these install methods.</p>

      {/* Status */}
      {assistant && (
        <div style={{
          marginBottom: 28, padding: '14px 18px', borderRadius: 10,
          background: assistant.crawlStatus === 'done' ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.08)',
          border: `1px solid ${assistant.crawlStatus === 'done' ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)'}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 18 }}>{assistant.crawlStatus === 'done' ? '✅' : '⏳'}</span>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {assistant.crawlStatus === 'done' ? 'Assistant ready for deployment' : 'Assistant is still being trained…'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
              Training site: <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent2)' }}>{assistant.websiteUrl}</span>
            </div>
          </div>
        </div>
      )}

      {/* API Key */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={cardHeader}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Your API Key</span>
          <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--surface)', padding: '3px 8px', borderRadius: 6 }}>Keep this secret</span>
        </div>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <code style={{
            flex: 1, fontFamily: 'var(--mono)', fontSize: 13,
            color: 'var(--accent2)', background: 'var(--surface)', padding: '10px 14px',
            borderRadius: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{apiKey}</code>
          <button onClick={() => copy(apiKey, 'key')} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border2)',
            background: copied === 'key' ? 'rgba(52,211,153,0.15)' : 'var(--surface)',
            color: copied === 'key' ? 'var(--green)' : 'var(--text2)', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
          }}>{copied === 'key' ? '✓ Copied' : 'Copy'}</button>
        </div>
      </div>

      {/* Method 1: Script Tag */}
      {[
        { id: 'script', title: '1. HTML Script Tag', subtitle: 'Paste before </body> on any page', code: snippetScript },
        { id: 'npm',    title: '2. NPM Package',     subtitle: 'For React, Vue, and SPA frameworks', code: snippetNPM },
        { id: 'next',   title: '3. Next.js',          subtitle: 'App Router or Pages Router', code: snippetNextjs },
      ].map(m => (
        <div key={m.id} style={{ ...card, marginBottom: 16 }}>
          <div style={cardHeader}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{m.subtitle}</div>
            </div>
            <button onClick={() => copy(m.code, m.id)} style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border2)',
              background: copied === m.id ? 'rgba(52,211,153,0.15)' : 'var(--surface)',
              color: copied === m.id ? 'var(--green)' : 'var(--text2)', fontSize: 13, fontWeight: 500,
            }}>{copied === m.id ? '✓ Copied' : 'Copy Code'}</button>
          </div>
          <pre style={{
            margin: 0, padding: '16px 20px', fontFamily: 'var(--mono)', fontSize: 12,
            color: 'var(--text2)', background: 'var(--bg)', overflow: 'auto', lineHeight: 1.6,
          }}>{m.code}</pre>
        </div>
      ))}

      {/* Checklist */}
      <div style={{ ...card, marginTop: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 15 }}>
          Deployment Checklist
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { done: assistant?.crawlStatus === 'done', label: 'Website crawled and AI trained' },
            { done: true, label: 'API key generated' },
            { done: !!assistant?.name, label: `Assistant named "${assistant?.name || 'Orra'}"` },
            { done: true, label: 'Lead capture configured' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: item.done ? 'rgba(52,211,153,0.15)' : 'var(--surface2)',
                border: `1px solid ${item.done ? 'var(--green)' : 'var(--border2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: 'var(--green)', flexShrink: 0,
              }}>{item.done ? '✓' : ''}</div>
              <span style={{ color: item.done ? 'var(--text)' : 'var(--text3)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
