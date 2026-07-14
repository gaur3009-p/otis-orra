import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Btn, Badge, Card, CardBody, CardHeader, CodeBlock } from '../components/UI';

export default function Home() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('voice');
  const [integrationTab, setIntegrationTab] = useState('html');

  const ctaText = auth ? 'Go to Knowledge Base Ingestion' : 'Get Started for Free';
  const ctaPath = auth ? '/onboarding' : '/login';

  const scrollToSection = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const codeSnippets = {
    html: `<!-- 1. HTML Widget Integration -->
<script
  src="https://api.orra.ai/widget.js"
  data-id="YOUR_API_KEY"
  data-api="https://api.orra.ai"
  data-ws="wss://voice.orra.ai"
  async
></script>`,
    react: `// 2. React Component Wrapper Integration
import React, { useEffect } from 'react';
import { initOrra } from '@orra/widget';

export default function OrraWidget() {
  useEffect(() => {
    initOrra({
      clientId: 'YOUR_API_KEY',
      apiUrl: 'https://api.orra.ai',
      wsUrl: 'wss://voice.orra.ai',
      theme: 'premium-dark'
    });
  }, []);

  return null; // The widget renders automatically in the bottom-right corner
}`
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: 'var(--font)',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* ── Background Blobs / Fog ── */}
      <div className="ambient-glow-wrapper">
        <div className="ambient-blob-indigo" style={{ width: 600, height: 600, top: '-5%', right: '-5%', opacity: 0.8 }} />
        <div className="ambient-blob-teal" style={{ width: 500, height: 500, bottom: '10%', left: '-5%', opacity: 0.7 }} />
        <div className="ambient-blob-pink" style={{ width: 400, height: 400, top: '40%', left: '30%', opacity: 0.5 }} />
      </div>

      {/* ── Navbar ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(5, 5, 8, 0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7c5cf4 0%, #0dd6b8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: '#fff',
            boxShadow: '0 0 16px rgba(124,92,244,0.4)',
          }}>
            ◎
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.5px' }}>Orra</span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 14, fontWeight: 500, color: 'var(--text2)' }}>
          <a href="#features" onClick={scrollToSection('features')} className="hover-link" style={{ transition: 'color 0.2s' }}>Features</a>
          <a href="#how-it-works" onClick={scrollToSection('how-it-works')} className="hover-link" style={{ transition: 'color 0.2s' }}>How it Works</a>
          <a href="#integration" onClick={scrollToSection('integration')} className="hover-link" style={{ transition: 'color 0.2s' }}>Integration</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {auth ? (
            <Btn variant="secondary" size="sm" onClick={() => navigate('/onboarding')}>Dashboard</Btn>
          ) : (
            <>
              <Btn variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Btn>
              <Btn variant="primary" size="sm" onClick={() => navigate('/login')}>Get Started</Btn>
            </>
          )}
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section style={{
        padding: '100px 40px 80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
      }}>
        <div className="fade-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--violet-bg)', border: '1px solid rgba(124,92,244,0.25)',
          borderRadius: 99, padding: '6px 14px', marginBottom: 24,
          fontSize: 12, fontWeight: 600, color: 'var(--violet-light)',
          letterSpacing: '0.5px', textTransform: 'uppercase',
          boxShadow: '0 0 20px rgba(124,92,244,0.1)',
        }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', boxShadow: '0 0 6px var(--teal)', animation: 'pulse-ring 2.5s infinite' }} />
          Orra v2.0 is Live
        </div>

        <h1 className="fade-up grad-text" style={{
          fontSize: '64px',
          fontWeight: 800,
          letterSpacing: '-2.5px',
          lineHeight: 1.05,
          maxWidth: 900,
          marginBottom: 24,
        }}>
          Real-time AI Voice Agents<br />For Any Website
        </h1>

        <p className="fade-up" style={{
          fontSize: '19px',
          color: 'var(--text2)',
          lineHeight: 1.6,
          maxWidth: 640,
          marginBottom: 36,
        }}>
          Train voice assistants instantly on your website content. Orra crawls, indexes, and delivers conversational speech with zero latency.
        </p>

        <div className="fade-up" style={{ display: 'flex', gap: 14, justify: 'center' }}>
          <Btn variant="primary" size="lg" onClick={() => navigate(ctaPath)}>
            {ctaText} →
          </Btn>
          <Btn variant="secondary" size="lg" onClick={scrollToSection('how-it-works')}>
            How It Works
          </Btn>
        </div>

        {/* Floating preview badge container */}
        <div className="fade-up" style={{
          marginTop: 64,
          width: '100%',
          maxWidth: 880,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-xl)',
          padding: 24,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
        }}>
          {/* Decorative browser dots */}
          <div style={{ display: 'flex', gap: 6, position: 'absolute', top: 16, left: 20 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f56' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ffbd2e' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#27c93f' }} />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '20px 24px',
            marginTop: 16,
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'linear-gradient(135deg, #7c5cf4, #0dd6b8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(124,92,244,0.3)',
                fontSize: 18, color: '#fff',
              }}>
                🎙️
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Active Integration</span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>Setup or check your Knowledge Base</h3>
              </div>
            </div>
            <Btn variant="primary" size="sm" onClick={() => navigate(ctaPath)}>
              Configure KB Now
            </Btn>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" style={{
        padding: '100px 40px',
        position: 'relative',
        zIndex: 2,
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>
            Engineered for Conversational Speech
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 16, maxWidth: 540, margin: '0 auto' }}>
            We've combined lightning-fast audio pipelines with retrieval augmentation to deliver a premium user experience.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            {
              icon: '🌐',
              title: 'Auto Website Ingestion',
              desc: 'Point to any website and Orra will parse, clean, and map its contents into vector embeddings instantly.'
            },
            {
              icon: '🎙️',
              title: 'ElevenLabs Streaming',
              desc: 'Ultra-low latency audio processing powered by advanced text-to-speech pipelines for seamless speaking.'
            },
            {
              icon: '🎯',
              title: 'High Intent Lead Capture',
              desc: 'Automatically prompt and capture visitor contact details contextually when buying indicators trigger.'
            },
            {
              icon: '🧠',
              title: 'Pinecone Vector Retrieval',
              desc: 'Accurate and source-backed answers directly mapped to the information on your live web documentation.'
            },
            {
              icon: '🎨',
              title: 'Custom Brand Identities',
              desc: "Adjust the assistant's name, conversational tone, and select from multiple lifelike voice models."
            },
            {
              icon: '🚀',
              title: 'One-Click Script Deploy',
              desc: 'Copy and paste a lightweight script tag, NPM widget, or Next.js layout script module to go live in seconds.'
            }
          ].map((feat, idx) => (
            <div key={idx} className="card-interactive" style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 28,
            }}>
              <div style={{ fontSize: 36, marginBottom: 20 }}>{feat.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: '#fff' }}>{feat.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.6 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Interactive How It Works ── */}
      <section id="how-it-works" style={{
        padding: '80px 40px',
        maxWidth: 1100,
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 60, alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--violet-light)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Three Easy Steps</span>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', marginTop: 8, marginBottom: 20 }}>
              How Orra Syncs With Your Website
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
              Get from signup to production in less than five minutes. Here is how our automated setup connects the dots.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { id: 'voice', label: '1. Link Knowledge Base', desc: 'Auto crawl URLs or paste custom pages directly.' },
                { id: 'tone', label: '2. Customize Voice & Behavior', desc: 'Select voice profiles and configure lead capture parameters.' },
                { id: 'deploy', label: '3. Embed Script Tag', desc: 'Inject the script widget and start serving real-time visitors.' }
              ].map(step => (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(step.id)}
                  style={{
                    background: activeTab === step.id ? 'var(--surface-hover)' : 'transparent',
                    border: `1px solid ${activeTab === step.id ? 'var(--border2)' : 'transparent'}`,
                    borderRadius: 12, padding: '16px 20px', textAlign: 'left',
                    cursor: 'pointer', transition: 'all 0.2s', width: '100%',
                  }}
                >
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: activeTab === step.id ? 'var(--violet-light)' : '#fff' }}>{step.label}</h4>
                  <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{step.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Screen Display */}
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border2)',
            borderRadius: 'var(--radius-xl)',
            padding: 32,
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            minHeight: 340,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            {activeTab === 'voice' && (
              <div className="fade-in">
                <span style={{ fontSize: 24 }}>🌐</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 12, marginBottom: 10 }}>Knowledge Base Ingestion</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>
                  Orra runs an automated background crawler that strips styling templates, boilerplate navigations, and gathers indexable body content into readable vectors.
                </p>
                <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--teal)' }}>
                  $ curl -X POST https://api.orra.ai/crawl \
                  <br />  -d "url=https://mysite.com"
                </div>
              </div>
            )}

            {activeTab === 'tone' && (
              <div className="fade-in">
                <span style={{ fontSize: 24 }}>🎙️</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 12, marginBottom: 10 }}>Lifelike Voice Synthesis</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>
                  Customize tone modifiers (friendly, professional, concierge) and connect to high-bandwidth WebSocket audio endpoints using ElevenLabs stream-chunks.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Badge variant="violet">ElevenLabs API</Badge>
                  <Badge variant="success">Nova Mode</Badge>
                  <Badge variant="default">99.8% Availability</Badge>
                </div>
              </div>
            )}

            {activeTab === 'deploy' && (
              <div className="fade-in">
                <span style={{ fontSize: 24 }}>🚀</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 12, marginBottom: 10 }}>Widget Integration</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>
                  Inject our tiny async JavaScript wrapper. It handles microphone audio rendering, connection drops, fallback browser speech, and keeps page layout loads fast.
                </p>
                <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)' }}>
                  &lt;script src="https://api.orra.ai/widget.js" async&gt;&lt;/script&gt;
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Integration Guide (HTML Widget to React comparison) ── */}
      <section id="integration" style={{
        padding: '100px 40px 80px',
        maxWidth: 1100,
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Developer Integration</span>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1.2px', marginTop: 8, marginBottom: 12 }}>
            From HTML Widget to React
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 15, maxWidth: 540, margin: '0 auto' }}>
            Choose the method that fits your stack. Integrate as a drop-in static script widget or compile as a React component.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setIntegrationTab('html')}
                style={{
                  background: 'none', border: 'none', padding: '10px 16px',
                  color: integrationTab === 'html' ? 'var(--violet-light)' : 'var(--text3)',
                  fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                  position: 'relative', transition: 'all 0.18s',
                }}
              >
                🌐 Drop-in HTML Widget
                {integrationTab === 'html' && (
                  <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: 'var(--violet)' }} />
                )}
              </button>
              <button
                onClick={() => setIntegrationTab('react')}
                style={{
                  background: 'none', border: 'none', padding: '10px 16px',
                  color: integrationTab === 'react' ? 'var(--violet-light)' : 'var(--text3)',
                  fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                  position: 'relative', transition: 'all 0.18s',
                }}
              >
                ⚛️ React Component
                {integrationTab === 'react' && (
                  <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: 'var(--violet)' }} />
                )}
              </button>
            </div>
            <Badge variant="violet">Latest SDK v2.0</Badge>
          </CardHeader>
          <CodeBlock code={codeSnippets[integrationTab]} />
        </Card>
      </section>

      {/* ── Sticky Bottom CTA Bar ── */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(124,92,244,0.12) 0%, rgba(13,214,184,0.06) 100%)',
        borderTop: '1px solid var(--border2)',
        padding: '24px 40px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Ready to launch your widget?</h4>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>Train vectors on your website content in one click.</p>
          </div>
          <Btn variant="primary" onClick={() => navigate(ctaPath)}>
            {ctaText} →
          </Btn>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{
        padding: '60px 40px',
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        fontSize: 13,
        color: 'var(--text3)',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 20 }}>
          <a href="#features" onClick={scrollToSection('features')} style={{ cursor: 'pointer' }}>Features</a>
          <a href="#how-it-works" onClick={scrollToSection('how-it-works')} style={{ cursor: 'pointer' }}>How it Works</a>
          <a href="#integration" onClick={scrollToSection('integration')} style={{ cursor: 'pointer' }}>Integration</a>
        </div>
        <p>© {new Date().getFullYear()} Orra Inc. All rights reserved. Designed for low latency speech.</p>
      </footer>
    </div>
  );
}
