import React from 'react'

const variantStyles = {
  default:  { bg: '#1e2330', color: '#e2e8f0' },
  accent:   { bg: 'rgba(110,142,251,0.15)', color: '#6e8efb' },
  warning:  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  error:    { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
  success:  { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
  purple:   { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
}

export function Badge({ children, variant = 'default', style = {} }) {
  const v = variantStyles[variant] || variantStyles.default
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px',
        fontWeight: 500,
        padding: '2px 7px',
        borderRadius: '4px',
        background: v.bg,
        color: v.color,
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
