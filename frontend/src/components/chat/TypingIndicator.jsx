import React from 'react'
import { Bot } from 'lucide-react'
import { PulseDots } from '../ui/Spinner'

export function TypingIndicator() {
  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        padding: '4px 0',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, rgba(110,142,251,0.2), rgba(167,139,250,0.2))',
          border: '1px solid rgba(110,142,251,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Bot size={15} color="#a78bfa" />
      </div>

      {/* Bubble */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 600 }}>Nanobot</span>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: '#141720',
            border: '1px solid rgba(110,142,251,0.2)',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          <PulseDots color="#6e8efb" />
          <span>Thinking…</span>
        </div>
      </div>
    </div>
  )
}
