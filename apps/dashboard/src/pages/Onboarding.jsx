import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import api from '../api';
import { PageHeader, Card, CardBody, CardHeader, Btn, Field, Input, Textarea, Badge, Spinner, EmptyState } from '../components/UI';

export default function Onboarding() {
  const { auth } = useAuth();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [assistant, setAssistant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(false);

  // New Knowledge Base & Manual Imports State
  const [activeTab, setActiveTab] = useState('crawl'); // 'crawl' | 'custom'
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customLoading, setCustomLoading] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [kbLoading, setKbLoading] = useState(false);

  // Chat/Sandbox State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [typing, setTyping] = useState(false);
  
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const chatEndRef = useRef(null);

  // Fetch Assistant configurations
  const fetchAssistant = async () => {
    try {
      const res = await api.get('/business/assistant');
      if (res.data.assistant) {
        setAssistant(res.data.assistant);
        setWebsiteUrl(res.data.assistant.websiteUrl || '');
        if (res.data.assistant.crawlStatus === 'crawling') {
          setPolling(true);
        } else {
          setPolling(false);
        }
      }
    } catch (err) {
      console.error('Failed to load assistant:', err);
    }
  };

  // Fetch Knowledge Base list
  const fetchKnowledgeBase = async () => {
    try {
      setKbLoading(true);
      const res = await api.get('/business/knowledge-base');
      setKnowledgeBase(res.data.pages || []);
    } catch (err) {
      console.error('Failed to load knowledge base:', err);
    } finally {
      setKbLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistant();
    fetchKnowledgeBase();
  }, []);

  // Poll for crawl status & update KB list
  useEffect(() => {
    let timer;
    if (polling) {
      timer = setInterval(async () => {
        try {
          const res = await api.get('/business/assistant');
          if (res.data.assistant) {
            setAssistant(res.data.assistant);
            if (res.data.assistant.crawlStatus !== 'crawling') {
              setPolling(false);
              clearInterval(timer);
              fetchKnowledgeBase();
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [polling]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Trigger web crawl
  const handleCrawl = async (e) => {
    e.preventDefault();
    if (!websiteUrl) return;
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: assistant?.name || 'Orra',
        voice: assistant?.voice || 'nova',
        tone: assistant?.tone || 'friendly',
        websiteUrl,
        leadCapture: assistant?.leadCapture ?? true,
      };
      const res = await api.post('/business/assistant', payload);
      setAssistant(res.data.assistant);
      setPolling(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start crawler');
    } finally {
      setLoading(false);
    }
  };

  // Submit manual custom page source (copied from Inspect)
  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customContent.trim()) return;
    setError('');
    setCustomLoading(true);

    try {
      const res = await api.post('/business/custom-content', {
        title: customTitle,
        content: customContent,
        url: customUrl
      });
      setAssistant(res.data.assistant);
      setCustomTitle('');
      setCustomContent('');
      setCustomUrl('');
      setPolling(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to index custom content');
    } finally {
      setCustomLoading(false);
    }
  };

  // Delete a page from KB
  const handleDeletePage = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page from your Knowledge Base? This will clean up its search vectors.')) return;
    try {
      setPolling(true);
      await api.delete(`/business/knowledge-base/${pageId}`);
      fetchAssistant();
    } catch (err) {
      console.error('Failed to delete page:', err);
      setError('Failed to delete page');
      setPolling(false);
    }
  };

  // Connect to Voice microservice WebSocket
  const connectWebSocket = () => {
    if (wsRef.current) return wsRef.current;

    const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:3001/voice`;
    const sessionId = `onboarding_${Date.now()}`;
    const socket = new WebSocket(`${wsUrl}?sessionId=${sessionId}&businessId=${auth?.business?.id}`);

    socket.onopen = () => {
      console.log('Voice socket connected');
      socket.send(JSON.stringify({
        type: 'config',
        assistantConfig: {
          name: assistant?.name || 'Orra',
          voice: assistant?.voice || 'nova',
          tone: assistant?.tone || 'friendly',
          leadCapture: assistant?.leadCapture ?? true,
        }
      }));
    };

    socket.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'transcript') {
        setMessages(prev => [...prev, { sender: 'user', text: msg.text }]);
        setTyping(true);
      } else if (msg.type === 'reply_text') {
        setTyping(false);
        setMessages(prev => [...prev, { sender: 'bot', text: msg.text, sources: msg.retrievedChunks }]);
      } else if (msg.type === 'audio') {
        try {
          const audioUrl = `data:audio/mpeg;base64,${msg.data}`;
          const audio = new Audio(audioUrl);
          await audio.play();
        } catch (err) {
          console.warn('Playback failed (needs user interaction):', err.message);
        }
      } else if (msg.type === 'tts_fallback') {
        try {
          const utterance = new SpeechSynthesisUtterance(msg.text);
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn('SpeechSynthesis failed:', err.message);
        }
      } else if (msg.type === 'error') {
        setTyping(false);
        setMessages(prev => [...prev, { sender: 'bot', text: 'Oops! Something went wrong processing your message.' }]);
      }
    };

    socket.onclose = () => {
      console.log('Voice socket closed');
      wsRef.current = null;
    };

    wsRef.current = socket;
    return socket;
  };

  // Send text question
  const handleSendText = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setTyping(true);

    const socket = connectWebSocket();
    if (socket.readyState === WebSocket.CONNECTING) {
      socket.addEventListener('open', () => {
        socket.send(JSON.stringify({ type: 'text_message', text }));
      });
    } else if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'text_message', text }));
    }
  };

  // Toggle voice streaming via mic
  const toggleListening = async () => {
    if (isListening) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsListening(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        const socket = connectWebSocket();

        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(e.data);
          }
        };

        recorder.start(250); // Send chunks every 250ms
        mediaRecorderRef.current = recorder;
        setIsListening(true);
        setTyping(true);
      } catch (err) {
        console.error('Failed to access microphone:', err);
        alert('Could not access your microphone. Please check permissions.');
      }
    }
  };

  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fade-up" style={{ padding: '40px 48px', maxWidth: 960, margin: '0 auto' }}>
      <PageHeader 
        title="Knowledge Base Ingestion" 
        subtitle="Train your AI voice assistant by crawling your site content and converting it to search vectors." 
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Side: link / train */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card>
            <CardHeader style={{ paddingBottom: 0 }}>
              <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--border)', width: '100%' }}>
                <button
                  onClick={() => setActiveTab('crawl')}
                  style={{
                    background: 'none', border: 'none', padding: '12px 6px',
                    color: activeTab === 'crawl' ? 'var(--violet-light)' : 'var(--text3)',
                    fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                    position: 'relative', transition: 'all 0.18s',
                  }}
                >
                  🌐 Auto Web Crawler
                  {activeTab === 'crawl' && (
                    <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: 'var(--violet)' }} />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('custom')}
                  style={{
                    background: 'none', border: 'none', padding: '12px 6px',
                    color: activeTab === 'custom' ? 'var(--violet-light)' : 'var(--text3)',
                    fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                    position: 'relative', transition: 'all 0.18s',
                  }}
                >
                  📋 Paste HTML / Text
                  {activeTab === 'custom' && (
                    <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: 'var(--violet)' }} />
                  )}
                </button>
              </div>
            </CardHeader>
            <CardBody>
              {activeTab === 'crawl' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.5 }}>
                    Enter your site's URL. We will parse its structure, scrape the visible text, and convert it into vector search indices.
                  </p>
                  <form onSubmit={handleCrawl} style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <Input
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        disabled={polling || loading}
                        required
                      />
                    </div>
                    <Btn type="submit" disabled={polling || loading}>
                      {loading ? <Spinner size={15} /> : polling ? 'Crawling...' : 'Train AI'}
                    </Btn>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.5 }}>
                    Pasted HTML, Inspect content, or raw Markdown. We parse this content instantly.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <Field label="Page Title">
                        <Input
                          placeholder="e.g. Pricing Details"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          disabled={polling || customLoading}
                          required
                        />
                      </Field>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Field label="Page URL">
                        <Input
                          type="url"
                          placeholder="https://site.com/pricing"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          disabled={polling || customLoading}
                        />
                      </Field>
                    </div>
                  </div>
                  <Field label="Page HTML / Text Content">
                    <Textarea
                      placeholder="Paste raw page HTML, text source or Markdown content..."
                      value={customContent}
                      onChange={(e) => setCustomContent(e.target.value)}
                      disabled={polling || customLoading}
                      required
                    />
                  </Field>
                  <Btn type="submit" disabled={polling || customLoading || !customContent.trim()} style={{ alignSelf: 'flex-start' }}>
                    {customLoading ? <Spinner size={15} /> : 'Index Content'}
                  </Btn>
                </form>
              )}

              {error && (
                <div style={{
                  marginTop: 14, background: 'var(--red-bg)', border: '1px solid rgba(245,90,90,0.2)',
                  borderRadius: 10, padding: '12px 14px', fontSize: 13, color: 'var(--red)',
                }}>
                  {error}
                </div>
              )}

              {/* Crawl Status Info */}
              {assistant && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Crawler Status</span>
                  <div>
                    {assistant.crawlStatus === 'pending' && <Badge variant="default">⚪ Pending</Badge>}
                    {assistant.crawlStatus === 'crawling' && (
                      <Badge variant="warning">
                        <span style={{ display: 'inline-block', animation: 'spinSlow 1.5s linear infinite', marginRight: 4 }}>⏳</span>
                        Crawling & Processing Vectors...
                      </Badge>
                    )}
                    {assistant.crawlStatus === 'done' && <Badge variant="success">✅ Ready & Active</Badge>}
                    {assistant.crawlStatus === 'error' && <Badge variant="danger">❌ Ingestion Failed</Badge>}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Active Knowledge base documents list */}
          <Card>
            <CardHeader>
              <span style={{ fontWeight: 700, fontSize: 14.5 }}>📚 Documents List ({knowledgeBase.length})</span>
            </CardHeader>
            <CardBody style={{ padding: '8px 22px 20px' }}>
              {kbLoading && knowledgeBase.length === 0 ? (
                <div style={{ display: 'flex', justify: 'center', padding: '30px 0' }}><Spinner size={20} /></div>
              ) : knowledgeBase.length === 0 ? (
                <div style={{ color: 'var(--text3)', fontSize: 13, fontStyle: 'italic', padding: '12px 0', textAlign: 'center' }}>
                  No pages index yet. Enter a website URL or paste custom HTML above to ingest content.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                  {knowledgeBase.map((page) => (
                    <div key={page.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'var(--bg3)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '10px 14px', gap: 12,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {page.title || 'Untitled document'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--mono)', marginTop: 2 }}>
                          {page.url || 'Manual ingestion'}
                        </div>
                      </div>
                      <Btn variant="danger" size="sm" onClick={() => handleDeletePage(page.id)} disabled={polling} style={{ padding: '6px 8px' }}>
                        🗑️
                      </Btn>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Side: Try out sandbox */}
        <div>
          {assistant && assistant.crawlStatus === 'done' ? (
            <Card className="fade-in active-pulse-border">
              <CardHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: 'var(--green)',
                    boxShadow: '0 0 8px var(--green)', animation: 'pulse-ring 2s infinite',
                  }} />
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>🤖 {assistant.name || 'Orra'} Sandbox</span>
                </div>
                <Badge variant="violet">Voice & Text Demo</Badge>
              </CardHeader>
              
              {/* Chat Container */}
              <div style={{
                height: 380, overflowY: 'auto', padding: 22,
                background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                {messages.length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text2)' }}>Voice Assistant Sandbox</div>
                    <p style={{ fontSize: 12, maxWidth: 240, marginTop: 4 }}>Ask a question about the content of your website or click the microphone to chat.</p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={i} style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start',
                      width: '100%',
                    }}>
                      <div style={{
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        fontSize: 13.5,
                        lineHeight: 1.5,
                        background: isUser
                          ? 'linear-gradient(135deg, #7c5cf4, #6643e2)'
                          : 'var(--bg3)',
                        color: isUser ? '#fff' : 'var(--text)',
                        border: isUser ? 'none' : '1px solid var(--border)',
                        borderBottomRightRadius: isUser ? 2 : 12,
                        borderBottomLeftRadius: isUser ? 12 : 2,
                      }}>
                        {msg.text}

                        {/* Citations */}
                        {!isUser && msg.sources && msg.sources.length > 0 && (
                          <div style={{
                            marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--border2)',
                          }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>
                              Retrieved Sources:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {msg.sources.map((src, idx) => (
                                <a
                                  key={idx}
                                  href={src.url.startsWith('http') ? src.url : '#'}
                                  target={src.url.startsWith('http') ? '_blank' : '_self'}
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: 11, color: 'var(--teal)', background: 'var(--teal-glow)',
                                    border: '1px solid rgba(13,214,184,0.18)', padding: '2px 8px',
                                    borderRadius: 5, textDecoration: 'none', transition: 'all 0.15s',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(13,214,184,0.15)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'var(--teal-glow)'}
                                  title={src.text}
                                >
                                  📄 {src.title || 'Page Source'}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {typing && (
                  <div style={{
                    alignSelf: 'flex-start', background: 'var(--bg3)', border: '1px solid var(--border)',
                    padding: '10px 14px', borderRadius: 12, borderBottomLeftRadius: 2,
                    display: 'flex', gap: 4, alignItems: 'center', width: 'fit-content',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text2)', animation: 'dot-bounce 1.2s infinite ease-in-out' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text2)', animation: 'dot-bounce 1.2s infinite ease-in-out', animationDelay: '0.2s' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text2)', animation: 'dot-bounce 1.2s infinite ease-in-out', animationDelay: '0.4s' }} />
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input row */}
              <CardBody style={{ display: 'flex', gap: 10, alignItems: 'center', borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={toggleListening}
                  style={{
                    width: 42, height: 42, borderRadius: '50%', border: 'none',
                    background: isListening ? 'var(--red)' : 'var(--bg3)',
                    border: `1px solid ${isListening ? 'var(--red)' : 'var(--border2)'}`,
                    color: isListening ? '#fff' : 'var(--text2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.22s',
                    fontSize: 16,
                    animation: isListening ? 'mic-ring 1.5s infinite' : 'none',
                  }}
                  title={isListening ? 'Stop recording microphone' : 'Start microphone connection'}
                >
                  {isListening ? '⏹' : '🎤'}
                </button>
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder="Ask a question..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                    disabled={isListening}
                  />
                </div>
                <Btn onClick={handleSendText} disabled={isListening || !inputText.trim()}>
                  Send
                </Btn>
              </CardBody>
            </Card>
          ) : (
            <EmptyState
              icon="🤖"
              title="Assistant Sandbox Offline"
              subtitle="Train your assistant by linking website documents or crawling your site structure first to launch the simulator."
            />
          )}
        </div>
      </div>
    </div>
  );
}