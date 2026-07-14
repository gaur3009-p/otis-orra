/**
 * Shared UI primitives for the Orra dashboard.
 * All components follow the Orra premium design system.
 */
import React, { useState } from 'react';

/* ── Page Header ─────────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: 36,
    }}>
      <div>
        <h1 className="grad-text" style={{
          fontSize: 32, fontWeight: 800, letterSpacing: '-1.2px',
          marginBottom: 6, lineHeight: 1.1,
        }}>{title}</h1>
        {subtitle && (
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ── Card ────────────────────────────────────────────── */
export function Card({ children, style = {}, className = '' }) {
  return (
    <div
      className={`card-interactive ${className}`}
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, style = {} }) {
  return (
    <div style={{
      padding: '16px 22px',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      ...style,
    }}>
      {children}
    </div>
  );
}

export function CardBody({ children, style = {} }) {
  return (
    <div style={{ padding: '20px 22px', ...style }}>
      {children}
    </div>
  );
}

/* ── Button ──────────────────────────────────────────── */
export function Btn({ children, onClick, type = 'button', variant = 'primary', disabled, size = 'md', style: extra = {} }) {
  const [hover, setHover] = useState(false);

  const sizes = {
    sm: { padding: '7px 14px', fontSize: 13, borderRadius: 8 },
    md: { padding: '10px 20px', fontSize: 14, borderRadius: 10 },
    lg: { padding: '13px 28px', fontSize: 15, borderRadius: 12 },
  };

  const variants = {
    primary: {
      background: hover && !disabled
        ? 'linear-gradient(135deg, #8d6df7, #0ee8ca)'
        : 'linear-gradient(135deg, #7c5cf4, #0dd6b8)',
      color: '#fff',
      border: 'none',
      boxShadow: hover && !disabled ? '0 6px 28px rgba(124,92,244,0.5)' : '0 3px 16px rgba(124,92,244,0.35)',
    },
    secondary: {
      background: hover && !disabled ? 'var(--surface-hover)' : 'var(--surface)',
      color: 'var(--text)',
      border: '1px solid var(--border2)',
      boxShadow: 'none',
    },
    ghost: {
      background: hover && !disabled ? 'var(--surface)' : 'transparent',
      color: 'var(--text2)',
      border: '1px solid transparent',
      boxShadow: 'none',
    },
    danger: {
      background: hover && !disabled ? 'rgba(245,90,90,0.2)' : 'var(--red-bg)',
      color: 'var(--red)',
      border: '1px solid rgba(245,90,90,0.25)',
      boxShadow: 'none',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...sizes[size],
        ...variants[variant],
        fontWeight: 600,
        fontFamily: 'var(--font)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'all 0.18s ease',
        transform: hover && !disabled ? 'translateY(-1px)' : 'translateY(0)',
        whiteSpace: 'nowrap',
        display: 'inline-flex', alignItems: 'center', gap: 7,
        ...extra,
      }}
    >
      {children}
    </button>
  );
}

/* ── Input Field ─────────────────────────────────────── */
export function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <label style={{
          fontSize: 12, fontWeight: 600,
          color: 'var(--text2)', letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>{label}</label>
      )}
      {children}
      {hint && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{hint}</p>}
    </div>
  );
}

export function Input({ style: extra = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      style={{
        width: '100%', padding: '11px 15px',
        background: focused ? 'rgba(124,92,244,0.05)' : 'var(--bg3)',
        border: `1px solid ${focused ? 'rgba(124,92,244,0.45)' : 'var(--border2)'}`,
        borderRadius: 10, color: 'var(--text)', fontSize: 14,
        outline: 'none', fontFamily: 'var(--font)',
        boxShadow: focused ? '0 0 0 3px rgba(124,92,244,0.12)' : 'none',
        transition: 'all 0.18s',
        ...extra,
      }}
    />
  );
}

export function Textarea({ style: extra = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      style={{
        width: '100%', padding: '11px 15px',
        background: focused ? 'rgba(124,92,244,0.05)' : 'var(--bg3)',
        border: `1px solid ${focused ? 'rgba(124,92,244,0.45)' : 'var(--border2)'}`,
        borderRadius: 10, color: 'var(--text)', fontSize: 14,
        outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
        minHeight: 130, lineHeight: 1.6,
        boxShadow: focused ? '0 0 0 3px rgba(124,92,244,0.12)' : 'none',
        transition: 'all 0.18s',
        ...extra,
      }}
    />
  );
}

/* ── Badge / Status ──────────────────────────────────── */
export function Badge({ variant = 'default', children }) {
  const variants = {
    default: { bg: 'var(--surface)', color: 'var(--text2)', border: 'var(--border2)' },
    success: { bg: 'var(--green-bg)', color: 'var(--green)', border: 'rgba(34,208,122,0.25)' },
    warning: { bg: 'var(--amber-bg)', color: 'var(--amber)', border: 'rgba(245,166,35,0.25)' },
    error:   { bg: 'var(--red-bg)',   color: 'var(--red)',   border: 'rgba(245,90,90,0.25)' },
    violet:  { bg: 'var(--violet-bg)',color: 'var(--violet-light)', border: 'rgba(124,92,244,0.3)' },
  };
  const v = variants[variant] || variants.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 6,
      background: v.bg, color: v.color, border: `1px solid ${v.border}`,
      fontSize: 12, fontWeight: 600,
    }}>{children}</span>
  );
}

/* ── Toggle ──────────────────────────────────────────── */
export function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 48, height: 26, borderRadius: 13, border: 'none',
        cursor: 'pointer', flexShrink: 0, position: 'relative',
        background: checked
          ? 'linear-gradient(135deg, #7c5cf4, #0dd6b8)'
          : 'var(--bg3)',
        border: `1px solid ${checked ? 'rgba(124,92,244,0.4)' : 'var(--border2)'}`,
        transition: 'all 0.22s',
        boxShadow: checked ? '0 0 12px rgba(124,92,244,0.35)' : 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: 3,
        left: checked ? 24 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
        display: 'block',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

/* ── Spinner ──────────────────────────────────────────── */
export function Spinner({ size = 20, color = 'var(--violet-light)' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid rgba(255,255,255,0.1)`,
      borderTopColor: color,
      animation: 'spinSlow 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

/* ── Empty State ─────────────────────────────────────── */
export function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 40px', textAlign: 'center',
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
    }}>
      <div style={{
        fontSize: 44, marginBottom: 20,
        filter: 'drop-shadow(0 0 20px rgba(124,92,244,0.3))',
      }}>{icon}</div>
      <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{title}</h3>
      {subtitle && <p style={{ color: 'var(--text2)', fontSize: 14, maxWidth: 320 }}>{subtitle}</p>}
    </div>
  );
}

/* ── Code Block ──────────────────────────────────────── */
export function CodeBlock({ code, onCopy, copied }) {
  return (
    <div style={{ position: 'relative' }}>
      <pre style={{
        margin: 0, padding: '18px 22px',
        fontFamily: 'var(--mono)', fontSize: 12.5,
        color: '#c5c5e8', background: 'var(--bg)',
        overflow: 'auto', lineHeight: 1.7, whiteSpace: 'pre-wrap',
        borderTop: '1px solid var(--border)',
      }}>{code}</pre>
      {onCopy && (
        <button
          onClick={onCopy}
          style={{
            position: 'absolute', top: 10, right: 12,
            padding: '5px 12px', borderRadius: 7,
            background: copied ? 'var(--green-bg)' : 'var(--surface-active)',
            border: `1px solid ${copied ? 'rgba(34,208,122,0.3)' : 'var(--border2)'}`,
            color: copied ? 'var(--green)' : 'var(--text2)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.18s',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      )}
    </div>
  );
}
