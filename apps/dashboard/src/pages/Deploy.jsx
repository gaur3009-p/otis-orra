import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import api from '../api';
import { PageHeader, Card, CardBody, CardHeader, Badge, CodeBlock } from '../components/UI';

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

initOrra({ 
  clientId: '${apiKey}', 
  apiUrl: '${apiUrl}', 
  wsUrl: '${wsUrl}' 
});`;

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

  return (
    <div className="fade-up" style={{ padding: '40px 48px', maxWidth: 840, margin: '0 auto' }}>
      <PageHeader
        title="Deploy Widget"
        subtitle="Go live by integrating your AI Voice Assistant snippet using any of our supported methods."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Sync Status Banner */}
        {assistant && (
          <div style={{
            padding: '16px 20px',
            borderRadius: 12,
            background: assistant.crawlStatus === 'done' ? 'var(--green-bg)' : 'var(--amber-bg)',
            border: `1px solid ${assistant.crawlStatus === 'done' ? 'rgba(34,208,122,0.25)' : 'rgba(245,166,35,0.25)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}>
            <span style={{ fontSize: 22 }}>
              {assistant.crawlStatus === 'done' ? '✨' : '⏳'}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>
                {assistant.crawlStatus === 'done' ? 'Assistant Core Fully Trained' : 'Assistant training in progress...'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                Model source url reference: <span style={{ fontFamily: 'var(--mono)', color: 'var(--violet-light)' }}>{assistant.websiteUrl}</span>
              </div>
            </div>
          </div>
        )}

        {/* API Credentials */}
        <Card>
          <CardHeader>
            <span style={{ fontWeight: 700, fontSize: 14.5 }}>🔑 Client API Key</span>
            <Badge variant="violet">Development / Production</Badge>
          </CardHeader>
          <CardBody style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <code style={{
              flex: 1, fontFamily: 'var(--mono)', fontSize: 13,
              color: 'var(--violet-light)', background: 'var(--bg)', padding: '10px 14px',
              borderRadius: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              border: '1px solid var(--border)',
            }}>{apiKey}</code>
            <button
              onClick={() => copy(apiKey, 'key')}
              style={{
                padding: '10px 18px', borderRadius: 8,
                background: copied === 'key' ? 'var(--green-bg)' : 'var(--surface)',
                border: `1px solid ${copied === 'key' ? 'rgba(34,208,122,0.3)' : 'var(--border2)'}`,
                color: copied === 'key' ? 'var(--green)' : 'var(--text2)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
              }}
            >
              {copied === 'key' ? '✓ Copied' : 'Copy Key'}
            </button>
          </CardBody>
        </Card>

        {/* Deployment Methods */}
        {[
          { id: 'script', title: '🌐 Method 1: HTML Script Tag', subtitle: 'Paste this snippet at the end of your <body> tags.', code: snippetScript },
          { id: 'npm',    title: '📦 Method 2: NPM Package Integration', subtitle: 'For Single Page Applications (SPA) built with React or Vue.', code: snippetNPM },
          { id: 'next',   title: '⚡ Method 3: Next.js Layout Script', subtitle: 'Utilize next/script tag with interactive strategy.', code: snippetNextjs },
        ].map(m => (
          <Card key={m.id}>
            <CardHeader>
              <div>
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>{m.title}</span>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{m.subtitle}</p>
              </div>
            </CardHeader>
            <CodeBlock
              code={m.code}
              onCopy={() => copy(m.code, m.id)}
              copied={copied === m.id}
            />
          </Card>
        ))}

        {/* Deployment checklist */}
        <Card>
          <CardHeader>
            <span style={{ fontWeight: 700, fontSize: 14.5 }}>✅ Readiness Checklist</span>
          </CardHeader>
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { done: assistant?.crawlStatus === 'done', label: 'Website content indexed into vector space' },
              { done: true, label: 'Client API Key generated successfully' },
              { done: !!assistant?.name, label: `Assistant configuration initialized with name "${assistant?.name || 'Orra'}"` },
              { done: assistant?.leadCapture, label: 'Lead Capture settings successfully activated' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13.5 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: item.done ? 'var(--green-bg)' : 'var(--bg3)',
                  border: `1px solid ${item.done ? 'var(--green)' : 'var(--border2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: 'var(--green)', flexShrink: 0,
                  transition: 'all 0.18s',
                }}>{item.done ? '✓' : ''}</div>
                <span style={{ color: item.done ? 'var(--text)' : 'var(--text3)', fontWeight: item.done ? 500 : 400 }}>{item.label}</span>
              </div>
            ))}
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
