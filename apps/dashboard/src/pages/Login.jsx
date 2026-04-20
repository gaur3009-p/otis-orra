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

  const inp = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid #2a2a3a', background: '#1c1c27',
    color: '#f0f0f8', fontSize: '14px', outline: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0f',
      backgroundImage: 'radial-gradient(ellipse at 60% 20%, rgba(124,110,245,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(167,139,250,0.08) 0%, transparent 50%)',
    }}>
      <div className="fade-in" style={{ width: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #7c6ef5, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', boxShadow: '0 0 40px rgba(124,110,245,0.25)',
          }}>◎</div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-1px', color: '#f0f0f8', margin: 0 }}>Orra</h1>
          <p style={{ color: '#9090aa', fontSize: '14px', marginTop: '6px' }}>AI Voice Infrastructure for Websites</p>
        </div>

        <div style={{
          background: '#111118', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '18px', padding: '32px',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: '#1c1c27', borderRadius: '10px', padding: '4px' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 500,
                background: mode === m ? '#111118' : 'transparent',
                color: mode === m ? '#f0f0f8' : '#5a5a72',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
              }}>{m === 'login' ? 'Sign In' : 'Create Account'}</button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'signup' && (
              <input style={inp} placeholder="Business name" value={form.name} onChange={set('name')} required />
            )}
            <input style={inp} type="email" placeholder="Email address" value={form.email} onChange={set('email')} required />
            <input style={inp} type="password" placeholder="Password" value={form.password} onChange={set('password')} required minLength={6} />

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#f87171' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: '12px 0', borderRadius: '10px', border: 'none', fontWeight: 600, fontSize: '15px',
              background: 'linear-gradient(135deg, #7c6ef5, #a78bfa)',
              color: '#fff', marginTop: '4px', cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 20px rgba(124,110,245,0.25)', transition: 'opacity 0.2s',
            }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
