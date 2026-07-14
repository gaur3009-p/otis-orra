import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

const NAV = [
  {
    to: '/onboarding',
    label: 'Knowledge Base',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    to: '/customize',
    label: 'Customize',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
  },
  {
    to: '/leads',
    label: 'Leads',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    to: '/deploy',
    label: 'Deploy',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    ),
  },
];

export default function Layout() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = auth?.business?.name?.[0]?.toUpperCase() || 'B';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside style={{
        width: collapsed ? 72 : 240,
        minWidth: collapsed ? 72 : 240,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
      }}>

        {/* Ambient glow at top */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 180, height: 120, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(124,92,244,0.18) 0%, transparent 70%)',
        }} />

        {/* Logo Row */}
        <div 
          onClick={() => navigate('/')}
          style={{
            padding: collapsed ? '20px 0' : '20px 18px',
            display: 'flex', alignItems: 'center',
            gap: 10, borderBottom: '1px solid var(--border)',
            justifyContent: collapsed ? 'center' : 'flex-start',
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          {/* Logo mark */}
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #7c5cf4 0%, #0dd6b8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,92,244,0.45)',
            fontSize: 16, fontWeight: 700, color: '#fff',
            letterSpacing: '-1px',
          }}>◎</div>

          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.5px', color: 'var(--text)', whiteSpace: 'nowrap' }}>Orra</div>
              <div style={{ fontSize: 10, color: 'var(--violet-light)', fontWeight: 500, letterSpacing: '0.8px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>AI Voice Platform</div>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: 'var(--text3)', padding: 4, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text2)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/>
              </svg>
            </button>
          )}

          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              style={{
                position: 'absolute', bottom: -14, right: -14,
                width: 22, height: 22, borderRadius: '50%',
                background: 'var(--bg3)', border: '1px solid var(--border2)',
                color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, zIndex: 11,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          )}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '14px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              title={collapsed ? n.label : undefined}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : 'var(--text2)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(124,92,244,0.7) 0%, rgba(13,214,184,0.4) 100%)'
                  : 'transparent',
                border: isActive ? '1px solid rgba(124,92,244,0.4)' : '1px solid transparent',
                boxShadow: isActive ? '0 2px 12px rgba(124,92,244,0.3)' : 'none',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                transition: 'all 0.18s ease',
              })}
              onMouseEnter={e => {
                const isActive = location.pathname === n.to;
                if (!isActive) e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={e => {
                const isActive = location.pathname === n.to;
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ flexShrink: 0 }}>{n.icon}</span>
              {!collapsed && <span>{n.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Status pill */}
        {!collapsed && (
          <div style={{ padding: '0 14px 16px' }}>
            <div style={{
              background: 'rgba(13,214,184,0.08)',
              border: '1px solid rgba(13,214,184,0.2)',
              borderRadius: 8, padding: '8px 12px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--teal)',
                boxShadow: '0 0 6px var(--teal)',
                animation: 'pulse-ring 2.5s infinite',
              }} />
              <span style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 500 }}>AI Active</span>
            </div>
          </div>
        )}

        {/* User Row */}
        <div style={{ padding: collapsed ? '12px 0' : '12px 8px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '8px 0' : '8px 10px',
            borderRadius: 10, width: '100%',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #7c5cf4, #0dd6b8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
              boxShadow: '0 0 12px rgba(124,92,244,0.4)',
            }}>{initials}</div>

            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{auth?.business?.name || 'Business'}</div>
                <button
                  onClick={handleLogout}
                  style={{
                    fontSize: 11, color: 'var(--text3)', background: 'none',
                    border: 'none', padding: 0, cursor: 'pointer',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                >Sign out</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', position: 'relative' }}>
        {/* Animated Premium Ambient Glow Layers */}
        <div className="ambient-glow-wrapper">
          <div className="ambient-blob-indigo" />
          <div className="ambient-blob-teal" />
          <div className="ambient-blob-pink" />
        </div>

        <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
