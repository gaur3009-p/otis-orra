import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { PageHeader, Card, CardBody, Btn, Field, Input, Toggle, Badge, Spinner } from '../components/UI';

const VOICES = [
  { id: 'alloy',   label: 'Alloy',   desc: 'Balanced & clear' },
  { id: 'echo',    label: 'Echo',    desc: 'Resonant & warm' },
  { id: 'fable',   label: 'Fable',   desc: 'Expressive & lively' },
  { id: 'onyx',    label: 'Onyx',    desc: 'Deep & authoritative' },
  { id: 'nova',    label: 'Nova',    desc: 'Bright & energetic' },
  { id: 'shimmer', label: 'Shimmer', desc: 'Soft & melodic' },
];

const TONES = [
  { id: 'friendly',     emoji: '😊', label: 'Friendly',     desc: 'Warm, conversational, approachable' },
  { id: 'professional', emoji: '💼', label: 'Professional',  desc: 'Clear, formal, authoritative' },
  { id: 'premium',      emoji: '✨', label: 'Premium',       desc: 'Refined, elegant, concierge-level' },
  { id: 'casual',       emoji: '👋', label: 'Casual',        desc: 'Relaxed, natural, like a friend' },
  { id: 'technical',    emoji: '⚙️', label: 'Technical',     desc: 'Precise, detailed, expert-level' },
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
    e.preventDefault();
    setError(''); setLoading(true); setSaved(false);
    try {
      await api.post('/business/assistant', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setLoading(false); }
  }

  return (
    <div className="fade-up" style={{ padding: '40px 48px', maxWidth: 760, margin: '0 auto' }}>
      <PageHeader
        title="Customize Assistant"
        subtitle="Configure your AI's identity, voice, and behavior."
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="secondary" onClick={() => navigate('/deploy')}>Deploy →</Btn>
            <Btn type="submit" form="customize-form" disabled={loading} variant={saved ? 'ghost' : 'primary'}>
              {loading ? <><Spinner size={15} /> Saving…</> : saved ? '✓ Saved!' : 'Save Changes'}
            </Btn>
          </div>
        }
      />

      <form id="customize-form" onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Assistant Name */}
        <Card>
          <CardBody>
            <Field
              label="Assistant Name"
              hint="This is what visitors will see and hear when interacting with your assistant."
            >
              <Input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Aria, Max, Zoe"
                maxLength={30}
              />
            </Field>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              marginTop: 16, padding: '10px 16px',
              background: 'var(--violet-bg)', border: '1px solid rgba(124,92,244,0.2)',
              borderRadius: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #7c5cf4, #0dd6b8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
              }}>◎</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {form.name || 'Orra'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Your AI assistant</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Voice Selection */}
        <Card>
          <CardBody>
            <Field
              label="Voice"
              hint="Powered by ElevenLabs — each voice has a distinct sonic character."
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 4 }}>
                {VOICES.map(v => {
                  const selected = form.voice === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => set('voice', v.id)}
                      style={{
                        padding: '12px 10px',
                        borderRadius: 12,
                        border: `1px solid ${selected ? 'rgba(124,92,244,0.55)' : 'var(--border)'}`,
                        background: selected
                          ? 'linear-gradient(135deg, rgba(124,92,244,0.18) 0%, rgba(13,214,184,0.1) 100%)'
                          : 'var(--bg3)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        cursor: 'pointer', transition: 'all 0.18s',
                        boxShadow: selected ? '0 0 16px rgba(124,92,244,0.25)' : 'none',
                      }}
                    >
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: selected ? 'var(--violet)' : 'var(--border2)',
                        boxShadow: selected ? '0 0 8px var(--violet)' : 'none',
                        transition: 'all 0.18s',
                        marginBottom: 2,
                      }} />
                      <span style={{
                        fontSize: 14, fontWeight: selected ? 700 : 500,
                        color: selected ? 'var(--violet-light)' : 'var(--text2)',
                        textTransform: 'capitalize',
                      }}>{v.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{v.desc}</span>
                    </button>
                  );
                })}
              </div>
            </Field>
          </CardBody>
        </Card>

        {/* Tone Selection */}
        <Card>
          <CardBody>
            <Field label="Tone" hint="Define how your assistant communicates with visitors.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {TONES.map(t => {
                  const selected = form.tone === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => set('tone', t.id)}
                      style={{
                        padding: '14px 18px', borderRadius: 12,
                        border: `1px solid ${selected ? 'rgba(124,92,244,0.45)' : 'var(--border)'}`,
                        background: selected
                          ? 'linear-gradient(90deg, rgba(124,92,244,0.14) 0%, rgba(13,214,184,0.06) 100%)'
                          : 'var(--bg3)',
                        display: 'flex', alignItems: 'center', gap: 16,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.18s',
                        boxShadow: selected ? '0 2px 14px rgba(124,92,244,0.2)' : 'none',
                      }}
                    >
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{t.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 600, fontSize: 14,
                          color: selected ? 'var(--text)' : 'var(--text2)',
                        }}>{t.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{t.desc}</div>
                      </div>
                      {selected && (
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #7c5cf4, #0dd6b8)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Field>
          </CardBody>
        </Card>

        {/* Lead Capture Toggle */}
        <Card>
          <CardBody style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                <span style={{ fontSize: 18 }}>🎯</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>Lead Capture</span>
                {form.leadCapture && <Badge variant="success">Active</Badge>}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 440 }}>
                Automatically collect visitor contact info when they show buying intent. Leads appear in your dashboard.
              </p>
            </div>
            <Toggle checked={form.leadCapture} onChange={v => set('leadCapture', v)} />
          </CardBody>
        </Card>

        {/* Error */}
        {error && (
          <div style={{
            background: 'var(--red-bg)', border: '1px solid rgba(245,90,90,0.25)',
            borderRadius: 10, padding: '12px 16px',
            color: 'var(--red)', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
