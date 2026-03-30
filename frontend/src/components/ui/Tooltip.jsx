import React, { useState, useRef, useEffect } from 'react'

export function Tooltip({ children, content, placement = 'top' }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  if (!content) return children

  const placementStyles = {
    top:    { bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top:    'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
    left:   { right:  'calc(100% + 6px)', top:  '50%', transform: 'translateY(-50%)' },
    right:  { left:   'calc(100% + 6px)', top:  '50%', transform: 'translateY(-50%)' },
  }

  return (
    <span
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            ...placementStyles[placement],
            background: '#1a1f2e',
            border: '1px solid #252d40',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
            color: '#e2e8f0',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'fade-in 0.1s ease forwards',
          }}
        >
          {content}
        </span>
      )}
    </span>
  )
}
