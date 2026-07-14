import React, { useState, useEffect } from 'react';
import api from '../api';
import { PageHeader, Card, CardBody, CardHeader, Btn, Input, Badge, EmptyState, Spinner } from '../components/UI';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchLeads(); }, [page]);

  async function fetchLeads() {
    setLoading(true);
    try {
      const { data } = await api.get(`/business/leads?page=${page}&limit=15`);
      setLeads(data.leads || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {} finally { setLoading(false); }
  }

  const filtered = leads.filter(l =>
    !search || [l.name, l.email, l.phone, l.queryContext].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-up" style={{ padding: '40px 48px', maxWidth: 1080, margin: '0 auto' }}>
      <PageHeader
        title="Leads Ingestion"
        subtitle={`${total} visitor lead${total !== 1 ? 's' : ''} captured via high buyer intent analysis.`}
        action={
          <div style={{ width: 240 }}>
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search leads..."
            />
          </div>
        }
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No Leads Captured Yet"
          subtitle="Deploy your chat snippet to your website. Visitors showing buying interest will trigger our agent to automatically log them here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Table Container */}
          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{
                    borderBottom: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.01)',
                  }}>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Contact Info</th>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Buying Context</th>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Intent Score</th>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Phone Number</th>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'right' }}>Logged</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => {
                    const isHighIntent = lead.intent === 'high_intent';
                    return (
                      <tr
                        key={lead.id}
                        style={{
                          borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Contact Name & Email */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                            {lead.name || <span style={{ color: 'var(--text3)' }}>Anonymous Visitor</span>}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)', marginTop: 3 }}>
                            {lead.email || '—'}
                          </div>
                        </td>

                        {/* Buying query context */}
                        <td style={{ padding: '16px 20px', maxWidth: 280 }}>
                          <div style={{
                            fontSize: 13, color: 'var(--text2)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }} title={lead.queryContext}>
                            {lead.queryContext || '—'}
                          </div>
                        </td>

                        {/* Intent Score */}
                        <td style={{ padding: '16px 20px' }}>
                          {isHighIntent ? (
                            <Badge variant="success">🔥 High Intent</Badge>
                          ) : (
                            <Badge variant="default">Medium Intent</Badge>
                          )}
                        </td>

                        {/* Phone Number */}
                        <td style={{ padding: '16px 20px', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text2)' }}>
                          {lead.phone || '—'}
                        </td>

                        {/* Time Logged */}
                        <td style={{ padding: '16px 20px', fontSize: 12.5, color: 'var(--text3)', textAlign: 'right' }}>
                          {timeAgo(lead.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination Row */}
          {pages > 1 && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    border: `1px solid ${page === p ? 'rgba(124,92,244,0.45)' : 'var(--border)'}`,
                    background: page === p
                      ? 'linear-gradient(135deg, rgba(124,92,244,0.18) 0%, rgba(13,214,184,0.06) 100%)'
                      : 'var(--bg3)',
                    color: page === p ? 'var(--violet-light)' : 'var(--text2)',
                    fontWeight: page === p ? 700 : 500,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    boxShadow: page === p ? '0 0 14px rgba(124,92,244,0.2)' : 'none',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
