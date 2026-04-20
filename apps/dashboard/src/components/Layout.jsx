import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const NAV = [
  { to: '/onboarding', icon: '⚡', label: 'Setup' },
  { to: '/customize',  icon: '🎨', label: 'Customize' },
  { to: '/leads',      icon: '🎯', label: 'Leads' },
  { to: '/deploy',     icon: '🚀', label: 'Deploy' },
];

export default function Layout() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 68 : 220, minWidth: collapsed ? 68 : 220,
        background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', transition: 'width 0.2s', overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #7c6ef5, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 0 20px var(--accent-glow)',
          }}>◎</div>
          {!collapsed && <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.5px', color: 'var(--text)' }}>Orra</span>}
          <button onClick={() => setCollapsed(c => !c)} style={{
            marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text3)',
            fontSize: 14, padding: 4,
          }}>{collapsed ? '→' : '←'}</button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: isActive ? 'var(--text)' : 'var(--text2)',
              background: isActive ? 'var(--surface)' : 'transparent',
              transition: 'all 0.15s',
              textDecoration: 'none',
              whiteSpace: 'nowrap', overflow: 'hidden',
            })}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
              {!collapsed && <span>{n.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 8,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: 'var(--accent-glow)', border: '1px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, color: 'var(--accent2)',
            }}>
              {auth?.business?.name?.[0]?.toUpperCase() || 'B'}
            </div>
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {auth?.business?.name || 'Business'}
                </div>
                <button onClick={handleLogout} style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}
