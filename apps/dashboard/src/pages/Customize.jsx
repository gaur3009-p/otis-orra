import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
const TONES = [
  { id: 'friendly',     label: 'Friendly',     desc: 'Warm, conversational, approachable' },
  { id: 'professional', label: 'Professional',  desc: 'Clear, formal, authoritative' },
  { id: 'premium',      label: 'Premium',       desc: 'Refined, elegant, concierge-level' },
  { id: 'casual',       label: 'Casual',        desc: 'Relaxed, natural, like a friend' },
  { id: 'technical',    label: 'Technical',     desc: 'Precise, detailed, expert-level' },
];

export default function Customize() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: 'Orra', voice: 'nova', tone: 'friendly', leadCapture: true, websiteUrl: '' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/business/assistant').then(r => {
      if (r.data.assistant) {
        const a = r.data.assistant;
        setForm({ name: a.name, voice: a.voice, tone: a.tone, leadCapture: a.leadCapture, websiteUrl: a.websiteUrl });
      }
    }).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function save(e) {
    e.preventDefault(); setError(''); setLoading(true); setSaved(false);
    try {
      await api.post('/business/assistant', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setLoading(false); }
  }

  const card = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 };
  const label = { fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 10, display: 'block' };
  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid var(--border2)', background: 'var(--surface)',
    color: 'var(--text)', fontSize: 14, outline: 'none',
  };

  return (
    <div className="fade-in" style={{ padding: '40px 48px', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.7px', marginBottom: 6 }}>Customize Assistant</h1>
      <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 36 }}>Set your assistant's identity, voice, and behavior.</p>

      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Name */}
        <div style={card}>
          <label style={label}>Assistant Name</label>
          <input style={inp} value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. Aria, Max, Zoe" maxLength={30} />
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>This is what visitors will see and hear.</p>
        </div>

        {/* Voice */}
        <div style={card}>
          <label style={label}>Voice</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {VOICES.map(v => (
              <button key={v} type="button" onClick={() => set('voice', v)} style={{
                padding: '10px 0', borderRadius: 10, border: `1px solid ${form.voice === v ? 'var(--accent)' : 'var(--border2)'}`,
                background: form.voice === v ? 'rgba(124,110,245,0.12)' : 'var(--surface)',
                color: form.voice === v ? 'var(--accent2)' : 'var(--text2)',
                fontWeight: form.voice === v ? 600 : 400, fontSize: 14,
                transition: 'all 0.15s', cursor: 'pointer', textTransform: 'capitalize',
              }}>{v}</button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 10 }}>Powered by ElevenLabs — each voice has a distinct character.</p>
        </div>

        {/* Tone */}
        <div style={card}>
          <label style={label}>Tone</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TONES.map(t => (
              <button key={t.id} type="button" onClick={() => set('tone', t.id)} style={{
                padding: '12px 16px', borderRadius: 10, border: `1px solid ${form.tone === t.id ? 'var(--accent)' : 'var(--border)'}`,
                background: form.tone === t.id ? 'rgba(124,110,245,0.1)' : 'var(--surface)',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: form.tone === t.id ? 'var(--accent)' : 'var(--border2)',
                  boxShadow: form.tone === t.id ? '0 0 8px var(--accent)' : 'none',
                  transition: 'all 0.15s',
                }} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: form.tone === t.id ? 'var(--text)' : 'var(--text2)' }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Lead Capture */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>Lead Capture</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>Automatically collect visitor info when they show buying intent.</div>
          </div>
          <button type="button" onClick={() => set('leadCapture', !form.leadCapture)} style={{
            width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', flexShrink: 0,
            background: form.leadCapture ? 'var(--accent)' : 'var(--surface2)',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <span style={{
              position: 'absolute', top: 3, left: form.leadCapture ? 25 : 3,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s', display: 'block',
            }} />
          </button>
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={loading} style={{
            padding: '12px 28px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 14,
            background: saved ? 'var(--green)' : 'linear-gradient(135deg, #7c6ef5, #a78bfa)',
            color: '#fff', boxShadow: '0 4px 16px var(--accent-glow)',
            opacity: loading ? 0.7 : 1, transition: 'background 0.3s',
          }}>
            {loading ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate('/deploy')} style={{
            padding: '12px 28px', borderRadius: 10, border: '1px solid var(--border2)',
            background: 'var(--surface)', color: 'var(--text)', fontWeight: 600, fontSize: 14,
          }}>Deploy →</button>
        </div>
      </form>
    </div>
  );
}
