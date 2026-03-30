import React, { useState, useRef, useEffect } from 'react'
import { Send, Mic, Paperclip } from 'lucide-react'

export function ChatInput({ onSend, disabled = false }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [value])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div
      style={{
        padding: '12px 16px',
        background: '#0d0f14',
        borderTop: '1px solid #1e2330',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          background: '#141720',
          border: '1px solid #1e2330',
          borderRadius: '10px',
          padding: '8px 12px',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocusCapture={e => {
          e.currentTarget.style.borderColor = '#6e8efb'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(110,142,251,0.1)'
        }}
        onBlurCapture={e => {
          e.currentTarget.style.borderColor = '#1e2330'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Fol-Tree anything about your files…"
          rows={1}
          autoFocus
          style={{
            flex: 1,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            color: '#e2e8f0',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            lineHeight: 1.6,
            maxHeight: '160px',
            overflowY: 'auto',
          }}
        />

        {/* Send Button */}
        <button
          id="chat-send-btn"
          onClick={handleSend}
          disabled={!canSend}
          style={{
            flexShrink: 0,
            width: '34px',
            height: '34px',
            borderRadius: '7px',
            background: canSend
              ? 'linear-gradient(135deg, #6e8efb, #a78bfa)'
              : '#1e2330',
            border: 'none',
            cursor: canSend ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: canSend ? '0 0 12px rgba(110,142,251,0.3)' : 'none',
          }}
          onMouseEnter={e => canSend && (e.currentTarget.style.boxShadow = '0 0 20px rgba(110,142,251,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = canSend ? '0 0 12px rgba(110,142,251,0.3)' : 'none')}
        >
          <Send size={15} color={canSend ? '#fff' : '#64748b'} />
        </button>
      </div>

      {/* Hint */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', padding: '0 2px' }}>
        <span style={{ fontSize: '10px', color: '#64748b' }}>
          ↵ Send  ·  ⇧↵ New line
        </span>
        <span style={{ fontSize: '10px', color: '#64748b' }}>
          {disabled ? 'Fol-Tree is thinking…' : 'Powered by Fol-Tree AI'}
        </span>
      </div>
    </div>
  )
}
