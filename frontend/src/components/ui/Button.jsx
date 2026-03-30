import React from 'react'

const variants = {
  primary: {
    background: 'linear-gradient(135deg, #6e8efb, #a78bfa)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 0 20px rgba(110,142,251,0.3)',
    hoverShadow: '0 0 28px rgba(110,142,251,0.5)',
  },
  secondary: {
    background: '#141720',
    color: '#e2e8f0',
    border: '1px solid #1e2330',
    boxShadow: 'none',
    hoverShadow: '0 0 12px rgba(110,142,251,0.15)',
  },
  ghost: {
    background: 'transparent',
    color: '#64748b',
    border: '1px solid transparent',
    boxShadow: 'none',
    hoverShadow: 'none',
  },
  danger: {
    background: 'transparent',
    color: '#ef4444',
    border: '1px solid #ef4444',
    boxShadow: 'none',
    hoverShadow: '0 0 12px rgba(239,68,68,0.2)',
  },
}

const sizes = {
  sm: { padding: '4px 10px', fontSize: '12px', borderRadius: '4px' },
  md: { padding: '8px 16px', fontSize: '13px', borderRadius: '6px' },
  lg: { padding: '12px 24px', fontSize: '14px', borderRadius: '8px' },
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  style = {},
  className = '',
  id,
  type = 'button',
  ...rest
}) {
  const v = variants[variant]
  const s = sizes[size]

  const baseStyle = {
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
    ...v,
    ...s,
    ...style,
  }

  function handleMouseEnter(e) {
    if (disabled || loading) return
    e.currentTarget.style.boxShadow = v.hoverShadow
    e.currentTarget.style.transform = 'translateY(-1px)'
    if (variant === 'ghost') e.currentTarget.style.color = '#e2e8f0'
    if (variant === 'secondary') e.currentTarget.style.borderColor = '#6e8efb'
  }
  function handleMouseLeave(e) {
    e.currentTarget.style.boxShadow = v.boxShadow
    e.currentTarget.style.transform = 'translateY(0)'
    if (variant === 'ghost') e.currentTarget.style.color = '#64748b'
    if (variant === 'secondary') e.currentTarget.style.borderColor = '#1e2330'
  }

  return (
    <button
      id={id}
      type={type}
      style={baseStyle}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...rest}
    >
      {loading && <Dot />}
      {children}
    </button>
  )
}

function Dot() {
  return (
    <span style={{
      display: 'inline-block',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      animation: 'spin-slow 0.7s linear infinite',
    }} />
  )
}
