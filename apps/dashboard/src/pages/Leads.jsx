import React, { useState, useEffect } from 'react';
import api from '../api';

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

  const intentColor = (intent) => intent === 'high_intent' ? 'var(--green)' : 'var(--text3)';
  const intentBg = (intent) => intent === 'high_intent' ? 'rgba(52,211,153,0.1)' : 'var(--surface2)';

  return (
    <div className="fade-in" style={{ padding: '40px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.7px', marginBottom: 4 }}>Leads</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>{total} total lead{total !== 1 ? 's' : ''} captured</p>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search leads…"
          style={{
            padding: '9px 16px', borderRadius: 10, border: '1px solid var(--border2)',
            background: 'var(--surface)', color: 'var(--text)', fontSize: 14, outline: 'none', width: 220,
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text3)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 80,
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>No leads yet</h3>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Deploy your widget and leads will appear here when visitors show buying intent.</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr 80px',
              padding: '12px 20px', borderBottom: '1px solid var(--border)',
              fontSize: 11, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.8px', textTransform: 'uppercase',
            }}>
              <span>Contact</span><span>Query Context</span><span>Intent</span><span>Phone</span><span>Time</span>
            </div>
            {filtered.map((lead, i) => (
              <div key={lead.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr 80px',
                padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{lead.name || <span style={{ color: 'var(--text3)' }}>Anonymous</span>}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{lead.email || '—'}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
                  {lead.queryContext || '—'}
                </div>
                <div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                    color: intentColor(lead.intent), background: intentBg(lead.intent),
                    textTransform: 'capitalize',
                  }}>
                    {lead.intent === 'high_intent' ? '🔥 High Intent' : lead.intent || '—'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{lead.phone || '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{timeAgo(lead.createdAt)}</div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: 36, height: 36, borderRadius: 8, border: `1px solid ${page === p ? 'var(--accent)' : 'var(--border2)'}`,
                  background: page === p ? 'rgba(124,110,245,0.15)' : 'var(--surface)',
                  color: page === p ? 'var(--accent2)' : 'var(--text2)',
                  fontWeight: page === p ? 600 : 400, fontSize: 14, cursor: 'pointer',
                }}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
