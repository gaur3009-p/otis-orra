import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import api from '../api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/business/login' : '/business/signup';
      const { data } = await api.post(endpoint, form);
      login(data.token, data.business);
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Animated background orbs ── */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,92,244,0.15) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,214,184,0.10) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '30%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,92,244,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* ── Left hero panel ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        borderRight: '1px solid var(--border)',
        background: 'linear-gradient(135deg, rgba(124,92,244,0.05) 0%, transparent 50%)',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #7c5cf4 0%, #0dd6b8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: '#fff',
              boxShadow: '0 0 30px rgba(124,92,244,0.5)',
            }}>◎</div>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>Orra</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 16 }}>
            AI Voice for<br />
            <span style={{
              background: 'linear-gradient(135deg, #a98bfa 0%, #0dd6b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Every Website</span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 400 }}>
            Deploy a trained AI voice assistant in minutes. No code required. Crawl your site, customize, and go live.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: '🧠', label: 'Trained on your website content' },
            { icon: '🎙️', label: 'Real-time voice & text interaction' },
            { icon: '🎯', label: 'Auto lead capture at high intent' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              transition: 'border-color 0.2s',
            }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text2)' }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right auth panel ── */}
      <div style={{
        width: 480,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
      }}>
        <div className="fade-up" style={{ width: '100%' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.7px', marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 32 }}>
            {mode === 'login' ? 'Sign in to access your AI dashboard' : 'Start deploying your AI voice assistant'}
          </p>

          {/* Mode Toggle */}
          <div style={{
            display: 'flex', gap: 4, marginBottom: 28,
            background: 'var(--bg3)', borderRadius: 12, padding: 4,
            border: '1px solid var(--border)',
          }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
                fontSize: 14, fontWeight: 600,
                background: mode === m
                  ? 'linear-gradient(135deg, rgba(124,92,244,0.8), rgba(13,214,184,0.6))'
                  : 'transparent',
                color: mode === m ? '#fff' : 'var(--text3)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: mode === m ? '0 2px 12px rgba(124,92,244,0.4)' : 'none',
              }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <InputField
                placeholder="Business name"
                value={form.name}
                onChange={set('name')}
                required
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21h18M9 21V7l3-4 3 4v14M5 21V11l4-2M19 21V11l-4-2"/></svg>}
              />
            )}
            <InputField
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={set('email')}
              required
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>}
            />
            <InputField
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            />

            {error && (
              <div style={{
                background: 'var(--red-bg)', border: '1px solid rgba(245,90,90,0.25)',
                borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--red)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 0', borderRadius: 12, border: 'none',
                fontWeight: 700, fontSize: 15, marginTop: 4, cursor: 'pointer',
                background: 'linear-gradient(135deg, #7c5cf4 0%, #0dd6b8 100%)',
                color: '#fff',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 24px rgba(124,92,244,0.4)',
                transition: 'all 0.2s',
                letterSpacing: '-0.2px',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,92,244,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,92,244,0.4)'; }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    display: 'inline-block',
                    animation: 'spinSlow 0.7s linear infinite',
                  }} />
                  Please wait…
                </span>
              ) : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

          <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginTop: 24 }}>
            By continuing, you agree to Orra's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({ icon, type = 'text', placeholder, value, onChange, required, minLength }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      background: focused ? 'rgba(124,92,244,0.06)' : 'var(--bg3)',
      border: `1px solid ${focused ? 'rgba(124,92,244,0.5)' : 'var(--border2)'}`,
      borderRadius: 12,
      transition: 'all 0.18s',
      boxShadow: focused ? '0 0 0 3px rgba(124,92,244,0.12)' : 'none',
    }}>
      <span style={{ color: focused ? 'var(--violet-light)' : 'var(--text3)', flexShrink: 0, transition: 'color 0.18s' }}>{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        minLength={minLength}
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)',
        }}
      />
    </div>
  );
}
