import React from 'react'

export function Spinner({ size = 20, color = '#6e8efb', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        animation: 'spin-slow 1s linear infinite',
        flexShrink: 0,
        ...style,
      }}
      aria-label="Loading"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke={color}
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <path
        d="M12 2 A10 10 0 0 1 22 12"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Pulse dots spinner for inline "thinking..." states */
export function PulseDots({ color = '#6e8efb' }) {
  return (
    <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: color,
            display: 'inline-block',
            animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  )
}
